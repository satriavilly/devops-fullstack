# Step-by-Step: Next.js + NestJS + PostgreSQL ke DevOps Pipeline
## Dari development lokal ke production-ready dengan Kubernetes local

---

## Overview: Aplikasi Anda

```
Frontend: Next.js (React)
├─ Port: 3000 (development)
├─ Port: 3001 (production in K8s)
└─ Build: npm run build

Backend: NestJS
├─ Port: 8080 (development)
├─ Port: 8080 (production in K8s)
└─ Build: npm run build

Database: PostgreSQL
├─ Port: 5432
└─ User: appuser, Password: password123

Architecture akan menjadi:
```
├─ Next.js (frontend pod)
├─ NestJS (backend pod)
└─ PostgreSQL (database pod)
```
```

---

## STAGE 1: Prepare Local Development Environment (Days 1-2)

### 1.1: Project Structure

```bash
# Create project directory
mkdir ~/myapp && cd ~/myapp

# Create monorepo structure
mkdir -p {frontend,backend,database,docker,k8s,ansible}

# Directory tree:
myapp/
├─ frontend/          (Next.js)
├─ backend/           (NestJS)
├─ database/          (PostgreSQL init scripts)
├─ docker/            (Dockerfiles)
├─ k8s/               (Kubernetes manifests)
├─ ansible/           (Ansible playbooks)
├─ docker-compose.yml (for local testing)
└─ .git               (Git repository)
```

### 1.2: Initialize Git Repository

```bash
cd ~/myapp
git init
git config user.email "dev@local"
git config user.name "Developer"

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
*.log
.env
.env.local
.DS_Store
EOF

git add .gitignore
git commit -m "Initial commit: project structure"
```

### 1.3: Create Next.js Frontend

```bash
# Navigate to frontend directory
cd frontend

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind

# Create .env.local untuk development
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080/api
EOF

# Install additional dependencies
npm install axios zustand
npm install -D tailwindcss postcss autoprefixer

# Test development server
npm run dev
# Verify: http://localhost:3000
```

### 1.4: Create NestJS Backend

```bash
# Navigate to backend directory
cd ../backend

# Create NestJS app
npx @nestjs/cli@latest new . --package-manager npm

# Install database packages
npm install @nestjs/typeorm typeorm pg dotenv class-validator

# Create .env untuk development
cat > .env << 'EOF'
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=appuser
DATABASE_PASSWORD=password123
DATABASE_NAME=myapp_db
NODE_ENV=development
EOF

# Create database module
npx @nestjs/cli g module database
npx @nestjs/cli g service database

# Test backend server
npm run start:dev
# Verify: http://localhost:8080
```

### 1.5: Setup Local PostgreSQL

```bash
# Option A: Using Docker (recommended for local dev)
docker run --name postgres-local \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=myapp_db \
  -p 5432:5432 \
  -d postgres:14-alpine

# Verify
docker logs postgres-local

# Option B: Using local PostgreSQL installation
sudo dnf install -y postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
```

### 1.6: Test All Three Locally

```bash
# Terminal 1: PostgreSQL (if not using Docker)
psql -U appuser -d myapp_db

# Terminal 2: NestJS backend
cd backend && npm run start:dev

# Terminal 3: Next.js frontend
cd frontend && npm run dev

# Test connectivity
curl http://localhost:8080/api/health
curl http://localhost:3000
```

---

## STAGE 2: Containerize Applications (Days 3-4)

### 2.1: Create Frontend Dockerfile

```dockerfile
# docker/Dockerfile.frontend
# Multi-stage build for Next.js

# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY frontend/ ./

# Build
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 2.2: Create Backend Dockerfile

```dockerfile
# docker/Dockerfile.backend
# Multi-stage build for NestJS

# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

RUN addgroup -g 1001 nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
```

### 2.3: Create PostgreSQL Dockerfile

```dockerfile
# docker/Dockerfile.postgres
FROM postgres:14-alpine

# Copy init scripts
COPY database/init.sql /docker-entrypoint-initdb.d/

# Environment variables are passed via K8s ConfigMap/Secret
ENV POSTGRES_USER=appuser
ENV POSTGRES_PASSWORD=password123
ENV POSTGRES_DB=myapp_db

EXPOSE 5432
```

### 2.4: Create database init script

```sql
-- database/init.sql
-- Initialize database schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
```

### 2.5: Build Docker images locally

```bash
# Build frontend image
docker build -f docker/Dockerfile.frontend -t myapp-frontend:v1.0.0 .

# Build backend image
docker build -f docker/Dockerfile.backend -t myapp-backend:v1.0.0 .

# Build PostgreSQL image
docker build -f docker/Dockerfile.postgres -t myapp-postgres:v1.0.0 .

# Verify images
docker images | grep myapp
```

### 2.6: Test with Docker Compose locally

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: myapp-postgres:v1.0.0
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: myapp_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: myapp-backend:v1.0.0
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: appuser
      DATABASE_PASSWORD: password123
      DATABASE_NAME: myapp_db
      NODE_ENV: production
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: myapp-frontend:v1.0.0
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

```bash
# Test with Docker Compose
docker-compose up -d

# Verify all services running
docker-compose ps

# Test connectivity
curl http://localhost:8080
curl http://localhost:3000

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```
docker tag myapp-postgres:v1.0.0 satriav/myapp-postgres:v1.0.0
docker push satriav/myapp-postgres:v1.0.0
---

## STAGE 3: Setup Kubernetes Cluster Locally (Day 5)

### 3.1: Start Kubernetes Cluster

docker login -u satriav

```bash
# Option A: Using Minikube (recommended)
#old minikube start --memory=8192 --cpus=4 --disk-size=50g
minikube start --driver=docker --memory=3072 --cpus=2 --disk-size=30g
# Option B: Using kubeadm (if already installed)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### 3.2: Setup Kubernetes namespaces

```bash
# Create namespaces
kubectl create namespace myapp          # Your application
kubectl create namespace monitoring     # Monitoring stack
kubectl create namespace argocd         # GitOps

# Label namespaces
kubectl label namespace myapp environment=production
kubectl label namespace monitoring environment=monitoring

# Verify
kubectl get namespaces
```

### 3.3: Create ConfigMap for application config

```yaml
# k8s/configmap.yaml
cat > ~/myapp/k8s/configmap.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: myapp
data:
  DATABASE_HOST: "postgres"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "myapp_db"
  NODE_ENV: "production"
  NEXT_PUBLIC_API_URL: "http://backend:8080/api"  
EOF
```

### 3.4: Create Secret for sensitive data

```bash
# Create secret from command line
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_USER=appuser \
  --from-literal=DATABASE_PASSWORD=password123 \
  --from-literal=JWT_SECRET=your-secret-key \
  -n myapp

# Or create from YAML (then encrypt with Sealed Secrets)
cat > k8s/secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: myapp
type: Opaque
stringData:
  DATABASE_USER: appuser
  DATABASE_PASSWORD: password123
  JWT_SECRET: your-secret-key
EOF

kubectl apply -f k8s/secret.yaml
```

---

## STAGE 4: Create Kubernetes Manifests (Days 6-7)

### 4.1: PostgreSQL Deployment

```yaml
# k8s/postgresql.yaml
cat > ~/myapp/k8s/postgresql.yaml << 'EOF'
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data/postgresql"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: myapp
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: myapp-postgres:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        - name: POSTGRES_DB
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_NAME
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
          subPath: postgres
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U appuser
          initialDelaySeconds: 30
          periodSeconds: 10
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: myapp
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
EOF
```

### 4.2: NestJS Backend Deployment

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: myapp-backend:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DATABASE_PORT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_PORT
        - name: DATABASE_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_NAME
        - name: DATABASE_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_USER
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: myapp
spec:
  selector:
    app: backend
  ports:
  - port: 8080
    targetPort: 8080
    name: http
  type: ClusterIP
```

### 4.3: Next.js Frontend Deployment

```yaml
# k8s/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: myapp-frontend:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NEXT_PUBLIC_API_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: myapp
spec:
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
    name: http
  type: NodePort
  nodePort: 30000
```

---

## STAGE 5: Deploy to Kubernetes (Week 2)

### 5.1: Apply all manifests

```bash
# Create namespace and secrets first
kubectl create namespace myapp
kubectl apply -f k8s/secret.yaml

# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Apply PostgreSQL
kubectl apply -f k8s/postgresql.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n myapp --timeout=300s

# Apply Backend
kubectl apply -f k8s/backend.yaml
kubectl wait --for=condition=ready pod -l app=backend -n myapp --timeout=300s

# Apply Frontend
kubectl apply -f k8s/frontend.yaml
kubectl wait --for=condition=ready pod -l app=frontend -n myapp --timeout=300s

# Verify all pods running
kubectl get pods -n myapp
```

### 5.2: Access applications

```bash
# Frontend (via NodePort)
# Open browser: http://localhost:30000

# Backend API
# Test: curl http://localhost:8080/api/health

# If using port-forward
kubectl port-forward svc/frontend 3000:3000 -n myapp
kubectl port-forward svc/backend 8080:8080 -n myapp
kubectl port-forward svc/postgres 5432:5432 -n myapp
```

### 5.3: Verify all services communicating

```bash
# Check backend logs
kubectl logs -f deployment/backend -n myapp

# Check frontend logs
kubectl logs -f deployment/frontend -n myapp

# Check PostgreSQL logs
kubectl logs -f deployment/postgres -n myapp

# Test API from within cluster
kubectl exec -it deployment/backend -n myapp -- curl http://backend:8080/health
```

---

## STAGE 6: Setup Complete DevOps Stack (Week 3)

### 6.1: Install Monitoring

```bash
# Add Helm repos
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Loki (logging)
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=20Gi

# Install Prometheus (metrics)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.retention=15d

#kube-prometheus-stack has been installed. Check its status by running:
  kubectl --namespace monitoring get pods -l "release=prometheus"

#Get Grafana 'admin' user password by running:

  kubectl --namespace monitoring get secrets prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo
[PASSWORD] zspOOIYa2CcXLbSmc3FAHeYwVuCb1dCfkTnrF7Kc

#Access Grafana local instance:

  export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=prometheus" -oname)
  kubectl --namespace monitoring port-forward $POD_NAME 3000

#troubleshoot grafana
#cek
kubectl get pods -n monitoring

kubectl describe pod prometheus-grafana-bcfcdcb9d-mbz4r -n monitoring

kubectl logs prometheus-grafana-bcfcdcb9d-mbz4r -n monitoring -c grafana --previous

kubectl get configmap -n monitoring

kubectl get configmap prometheus-kube-prometheus-grafana-datasource -n monitoring -o yaml

kubectl get configmap -n monitoring -o yaml | grep -B 10 -A 20 "isDefault"

kubectl edit configmap loki-loki-stack -n monitoring
#Restart Grafana Pod
kubectl delete pod -n monitoring -l app.kubernetes.io/name=grafana

#
kubectl get pods -n monitoring -w
#

#Get your grafana admin user password by running:

  kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo


# login grafana
kubectl port-forward svc/loki-grafana -n monitoring 3000:80 &
# URL: http://localhost:3000
# Default: admin/admin123
Connections -> Data Sources

Prometheus -> Up

#kalau loki ga jalan di grafana
kubectl get svc -n monitoring | grep loki

#grafana ga bisa ngambil data
kubectl edit configmap prometheus-kube-prometheus-grafana-datasource -n monitoring

kubectl rollout restart deployment prometheus-grafana -n monitoring

kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

```

### 6.2: Install ArgoCD for GitOps

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8081:443 &

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 6.3: Create Git repository for k8s configs

```bash
# Create separate repo for k8s configs
mkdir ~/my-k8s-config
cd ~/my-k8s-config
git init

git remote add origin https://github.com/satriavilly/fullstack-app-dummy-k8s-config.git
# Copy your k8s manifests
cp -r ~/myapp/k8s .

# Create ArgoCD application
cat > argocd-app.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: file:///home/user/my-k8s-config
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF

git add .
git commit -m "K8s configs for ArgoCD"

# Apply ArgoCD app
kubectl apply -f argocd-app.yaml
```
git remote add origin https://github.com/satriavilly/fullstack-app-dummy-k8s-config.git
git add .
git commit -m "Initial Kubernetes manifests"
git branch -M main
git push origin main
---

## STAGE 7: GitHub & Docker Hub Integration (Week 4)

### 7.1: Push images to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag myapp-frontend:v1.0.0 your-username/myapp-frontend:v1.0.0
docker tag myapp-backend:v1.0.0 your-username/myapp-backend:v1.0.0

# Push images
docker push your-username/myapp-frontend:v1.0.0
docker push your-username/myapp-backend:v1.0.0

# Update K8s manifests to use Docker Hub images
# In k8s/frontend.yaml and k8s/backend.yaml:
# Change:
# image: myapp-frontend:v1.0.0
# To:
# image: your-username/myapp-frontend:v1.0.0
```

### 7.2: Setup GitHub Actions CI/CD

```yaml
# .github/workflows/build-and-push.yml
name: Build and Push Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: docker/Dockerfile.frontend
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/myapp-frontend:latest
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: docker/Dockerfile.backend
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/myapp-backend:latest
```

### 7.3: Commit and push to GitHub

```bash
# Add GitHub remote
cd ~/myapp
git remote add origin https://github.com/your-username/myapp.git

# Push to GitHub
git branch -M main
git push -u origin main

# GitHub Actions will automatically build and push images
```
```bash
# Telegram
# Create application.yaml
cat > application.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: fullstack-app
  namespace: argocd
  annotations:
    notifications.argoproj.io/subscribe.on-deployed.telegram: "199643258"
    notifications.argoproj.io/subscribe.on-sync-failed.telegram: "199643258"
    notifications.argoproj.io/subscribe.on-degraded.telegram: "199643258"
spec:
  project: default
  source:
    repoURL: https://github.com/satriavilly/fullstack-app-dummy-k8s-config.git
    targetRevision: HEAD
    path: .
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

# Create argocd-notifications-cm.yaml
cat > argocd-notifications-cm.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  service.telegram: |
    token: $telegram-token

  template.app-deployed: |
    message: |
      ✅ *ArgoCD: Deploy Berhasil*
      App: `{{.app.metadata.name}}`
      Status: `{{.app.status.sync.status}}`
      Health: `{{.app.status.health.status}}`
      Revision: `{{.app.status.sync.revision | substr 0 7}}`
      {{if .app.status.operationState.syncResult.source.repoURL}}Repo: {{.app.status.operationState.syncResult.source.repoURL}}{{end}}

  template.app-sync-failed: |
    message: |
      ❌ *ArgoCD: Sync GAGAL*
      App: `{{.app.metadata.name}}`
      Status: `{{.app.status.sync.status}}`
      Error: {{.app.status.conditions | toJson}}

  template.app-degraded: |
    message: |
      ⚠️ *ArgoCD: App Degraded*
      App: `{{.app.metadata.name}}`
      Health: `{{.app.status.health.status}}`
      Message: {{.app.status.health.message}}

  trigger.on-deployed: |
    - when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
      send: [app-deployed]

  trigger.on-sync-failed: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed]

  trigger.on-degraded: |
    - when: app.status.health.status == 'Degraded'
      send: [app-degraded]

  defaultTriggers: |
    - on-deployed
    - on-sync-failed
    - on-degraded
EOF

# Create argocd-notifications-secret.yaml
cat > argocd-notifications-secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: argocd-notifications-secret
  namespace: argocd
type: Opaque
stringData:
  telegram-token: 8656909780:AAGN8zMsnlS20u89-Wv1b5x2s8R1T63LdGg
EOF

  # 1. Apply secret (langsung ke cluster, JANGAN di-commit)
  kubectl apply -f argocd/argocd-notifications-secret.yaml

  # 2. Apply configmap notifikasi
  kubectl apply -f argocd/argocd-notifications-cm.yaml

  # 3. Apply ArgoCD Application
  kubectl apply -f argocd/application.yaml
```
---

## Complete File Structure

```
myapp/
├─ frontend/
│  ├─ pages/
│  ├─ components/
│  ├─ public/
│  ├─ styles/
│  ├─ package.json
│  ├─ .env.local
│  └─ next.config.js
│
├─ backend/
│  ├─ src/
│  │  ├─ app.controller.ts
│  │  ├─ app.service.ts
│  │  ├─ database/
│  │  ├─ entities/
│  │  └─ main.ts
│  ├─ .env
│  └─ package.json
│
├─ database/
│  └─ init.sql
│
├─ docker/
│  ├─ Dockerfile.frontend
│  ├─ Dockerfile.backend
│  └─ Dockerfile.postgres
│
├─ k8s/
│  ├─ postgresql.yaml
│  ├─ backend.yaml
│  ├─ frontend.yaml
│  ├─ configmap.yaml
│  └─ secret.yaml
│
├─ ansible/
│  └─ playbooks/
│
├─ .github/
│  └─ workflows/
│     └─ build-and-push.yml
│
├─ docker-compose.yml
├─ .gitignore
└─ README.md
```

---

## Weekly Timeline

```
WEEK 1: Setup Local Development
├─ Day 1-2: Create Next.js, NestJS, PostgreSQL locally
├─ Day 3-4: Containerize (Docker)
└─ Day 5: Test with Docker Compose

WEEK 2: Kubernetes Deployment
├─ Day 1: Setup K8s cluster
├─ Day 2-3: Create K8s manifests
├─ Day 4-5: Deploy and verify
└─ Day 6-7: Application integration

WEEK 3: DevOps Stack
├─ Day 1-2: Monitoring (Prometheus, Grafana, Loki)
├─ Day 3: GitOps (ArgoCD)
└─ Day 4-5: Testing & verification

WEEK 4: CI/CD Integration
├─ Day 1-2: Docker Hub setup
├─ Day 3-4: GitHub Actions
├─ Day 5: Automation testing
└─ Day 6-7: Production verification

RESULT: Complete DevOps pipeline ✅
```

---

## Testing Checklist

### Week 1 Testing
- [ ] Next.js app runs locally on :3000
- [ ] NestJS API runs locally on :8080
- [ ] PostgreSQL runs locally on :5432
- [ ] All three communicate correctly

### Week 2 Testing
- [ ] K8s cluster running
- [ ] All pods deployed successfully
- [ ] Frontend accessible via NodePort
- [ ] Backend API responding
- [ ] Database accessible
- [ ] Persistent data saved correctly

### Week 3 Testing
- [ ] Prometheus scraping metrics
- [ ] Loki collecting logs
- [ ] Grafana showing dashboards
- [ ] ArgoCD watching Git repo
- [ ] Alerts triggering correctly

### Week 4 Testing
- [ ] Images building in CI
- [ ] Images pushing to Docker Hub
- [ ] GitHub Actions workflows running
- [ ] Auto-deploy on Git push
- [ ] Production-ready

---

## Essential Commands Reference

```bash
# Local Development
npm install          # Install dependencies
npm run dev         # Start dev server
docker-compose up   # Start all services

# Docker
docker build        # Build image
docker push         # Push to registry
docker logs         # View container logs

# Kubernetes
kubectl apply       # Deploy manifests
kubectl get pods    # List pods
kubectl logs        # View pod logs
kubectl port-forward # Access services locally
kubectl delete      # Delete resources

# Git
git add             # Stage changes
git commit          # Commit changes
git push            # Push to GitHub

# Helm
helm install        # Install chart
helm upgrade        # Update release
helm list           # List releases
```

---

## Next Steps After Setup

1. **Add authentication** (JWT in NestJS)
2. **Add API endpoints** for your business logic
3. **Add frontend pages** and components
4. **Implement database migrations** (TypeORM)
5. **Add unit & integration tests**
6. **Setup CI/CD for testing** in GitHub Actions
7. **Add security scanning** (DevSecOps essentials)
8. **Scale to multiple replicas** in K8s
9. **Setup backup procedures** for PostgreSQL
10. **Monitor production metrics** in Grafana

---

**Congratulations! You now have a complete DevOps setup from code to production!** 🚀
