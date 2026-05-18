# Quick Start Checklist: Next.js + NestJS + PostgreSQL to Kubernetes

---

## WEEK 1 Checklist: Local Development

### Day 1: Project Setup
- [ ] Create ~/myapp directory
- [ ] Initialize Git repository
- [ ] Create directory structure (frontend, backend, database, docker, k8s)
- [ ] Commit: "Initial commit: project structure"

### Day 2: Frontend (Next.js)
- [ ] Run: `npx create-next-app@latest ./frontend --typescript --tailwind`
- [ ] Install: `npm install axios zustand`
- [ ] Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- [ ] Test: `npm run dev` → verify http://localhost:3000
- [ ] Commit frontend code

### Day 2: Backend (NestJS)
- [ ] Run: `npx @nestjs/cli@latest new ./backend`
- [ ] Install: `npm install @nestjs/typeorm typeorm pg dotenv class-validator`
- [ ] Create `.env` with database credentials
- [ ] Create database module: `npx @nestjs/cli g module database`
- [ ] Create health check endpoint: `@Get('/health')`
- [ ] Test: `npm run start:dev` → verify http://localhost:8080/health
- [ ] Commit backend code

### Day 3: Database (PostgreSQL)
- [ ] Run PostgreSQL via Docker: `docker run --name postgres-local ... postgres:14-alpine`
- [ ] Create init.sql with schema
- [ ] Verify connection: `psql -U appuser -d myapp_db`
- [ ] Create tables (users, products, etc.)
- [ ] Test NestJS connects to DB
- [ ] Commit database scripts

### Days 4-5: Docker Containerization
- [ ] Create `docker/Dockerfile.frontend` (multi-stage)
- [ ] Create `docker/Dockerfile.backend` (multi-stage)
- [ ] Create `docker/Dockerfile.postgres`
- [ ] Build images: `docker build -f docker/Dockerfile.frontend ...`
- [ ] Verify images: `docker images | grep myapp`
- [ ] Create `docker-compose.yml`
- [ ] Test: `docker-compose up -d`
- [ ] Verify all services running: `docker-compose ps`
- [ ] Test connectivity between services
- [ ] Commit Docker files

**End of Week 1**: All three apps running in Docker ✅

---

## WEEK 2 Checklist: Kubernetes Setup

sudo dnf update -y
sudo dnf install -y curl wget conntrack
sudo dnf install -y dnf-plugins-core

sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo systemctl status docker
sudo usermod -aG docker $USER

newgrp docker
docker ps

exit

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

kubectl version --client

### Day 1: Cluster Setup
- [ ] Start Minikube: `minikube start --memory=8192 --cpus=4 --disk-size=50g`
set ram: minikube start --driver=docker --memory=3072 --cpus=2 --disk-size=30g
- [ ] Verify: `kubectl cluster-info`
- [ ] Create namespaces: `kubectl create namespace myapp`
- [ ] Create namespaces: `kubectl create namespace monitoring`
- [ ] Verify: `kubectl get namespaces`

### Day 1: Secrets & ConfigMaps
- [ ] Create secret: `kubectl create secret generic app-secrets ...`
- [ ] Create ConfigMap: `kubectl apply -f k8s/configmap.yaml`
- [ ] Verify: `kubectl get secrets,cm -n myapp`

### Days 2-3: PostgreSQL Manifest
- [ ] Create `k8s/postgresql.yaml` with:
  - [ ] PersistentVolume
  - [ ] PersistentVolumeClaim
  - [ ] Deployment
  - [ ] Service
- [ ] Apply: `kubectl apply -f k8s/postgresql.yaml`
- [ ] Verify pod running: `kubectl get pods -n myapp`
- [ ] Test connection: `kubectl exec -it pod/postgres... -- psql -U appuser`

### Day 4: NestJS Backend Manifest
- [ ] Create `k8s/backend.yaml` with:
  - [ ] Deployment (2 replicas)
  - [ ] Service
  - [ ] Health probes
  - [ ] Resource limits
- [ ] Apply: `kubectl apply -f k8s/backend.yaml`
- [ ] Wait for ready: `kubectl wait --for=condition=ready pod ...`
- [ ] Test: `kubectl logs deployment/backend -n myapp`

### Day 5: Next.js Frontend Manifest
- [ ] Create `k8s/frontend.yaml` with:
  - [ ] Deployment (2 replicas)
  - [ ] Service (NodePort 30000)
  - [ ] Health probes
  - [ ] Resource limits
- [ ] Apply: `kubectl apply -f k8s/frontend.yaml`
- [ ] Verify: `kubectl get pods,svc -n myapp`
- [ ] Access: http://localhost:30000
- [ ] Commit all K8s manifests

**End of Week 2**: All apps running in Kubernetes ✅

---

## WEEK 3 Checklist: DevOps Stack

### Day 1: Monitoring Infrastructure
- [ ] Add Helm repos:
  - [ ] `helm repo add grafana https://grafana.github.io/helm-charts`
  - [ ] `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts`
  - [ ] `helm repo update`
- [ ] Create monitoring namespace: `kubectl create namespace monitoring`

### Day 1-2: Loki & Grafana
- [ ] Install Loki: `helm install loki grafana/loki-stack -n monitoring ...`
- [ ] Wait for pod: `kubectl wait --for=condition=ready pod -l app=loki -n monitoring`
- [ ] Port forward: `kubectl port-forward svc/loki-grafana -n monitoring 3000:80`
- [ ] Access Grafana: http://localhost:3000 (admin/admin123)
- [ ] Add Loki datasource
- [ ] Verify logs visible

### Day 2: Prometheus
- [ ] Install Prometheus: `helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring`
- [ ] Wait for pod: `kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring`
- [ ] Port forward: `kubectl port-forward svc/prometheus -n monitoring 9090:9090`
- [ ] Access Prometheus: http://localhost:9090
- [ ] Verify targets scraping

### Day 3: Add Application Monitoring
- [ ] Add metrics endpoint to NestJS backend
- [ ] Create ServiceMonitor for backend
- [ ] Verify metrics in Prometheus
- [ ] Create Grafana dashboard

### Days 4-5: GitOps with ArgoCD
- [ ] Create namespace: `kubectl create namespace argocd`
- [ ] Install ArgoCD: `kubectl apply -n argocd -f manifest.yaml`
- [ ] Wait for pod: `kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server`
- [ ] Get password: `kubectl -n argocd get secret argocd-initial-admin-secret ...`
- [ ] Port forward: `kubectl port-forward svc/argocd-server -n argocd 8081:443`
- [ ] Access ArgoCD: https://localhost:8081
- [ ] Create local Git repo: `mkdir ~/my-k8s-config`
- [ ] Copy K8s manifests to Git repo
- [ ] Create ArgoCD Application resource
- [ ] Verify ArgoCD syncing

**End of Week 3**: Full observability stack deployed ✅

---

## WEEK 4 Checklist: CI/CD Integration

### Day 1: GitHub Repository Setup
- [ ] Create GitHub repo: `your-username/myapp`
- [ ] Add remote: `git remote add origin https://github.com/...`
- [ ] Verify remote: `git remote -v`

### Day 1-2: Docker Hub Integration
- [ ] Create Docker Hub account
- [ ] Create Docker Hub repositories:
  - [ ] `your-username/myapp-frontend`
  - [ ] `your-username/myapp-backend`
- [ ] Login locally: `docker login`
- [ ] Tag images:
  - [ ] `docker tag myapp-frontend:v1.0.0 your-username/myapp-frontend:v1.0.0`
  - [ ] `docker tag myapp-backend:v1.0.0 your-username/myapp-backend:v1.0.0`
- [ ] Push images: `docker push your-username/myapp-frontend:v1.0.0`
- [ ] Verify in Docker Hub

### Day 2: Update K8s Manifests
- [ ] Update image references in K8s manifests to use Docker Hub
- [ ] Change `imagePullPolicy` to `Always`
- [ ] Apply updated manifests: `kubectl apply -f k8s/*.yaml`
- [ ] Verify pods pulling from Docker Hub

### Days 3-4: GitHub Actions Setup
- [ ] Create `.github/workflows/build-and-push.yml`
- [ ] Add secrets to GitHub:
  - [ ] `DOCKER_USERNAME`
  - [ ] `DOCKER_PASSWORD`
- [ ] Commit workflow file
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify workflow running in GitHub Actions
- [ ] Verify images pushed to Docker Hub

### Day 4-5: ArgoCD Git Integration
- [ ] Create separate repo: `your-username/my-k8s-config`
- [ ] Push K8s manifests to GitHub
- [ ] Configure ArgoCD to watch GitHub repo (instead of local)
- [ ] Test: Modify manifest → push to GitHub → ArgoCD auto-syncs
- [ ] Verify: Application redeployed automatically

### Day 5: End-to-End Test
- [ ] Commit code change to main repo
- [ ] Verify GitHub Actions builds
- [ ] Verify Docker images pushed to Hub
- [ ] Wait for ArgoCD sync
- [ ] Verify new version deployed in K8s
- [ ] Test application in browser
- [ ] Check logs in Grafana
- [ ] Verify metrics in Prometheus

**End of Week 4**: Complete CI/CD pipeline working ✅

---

## Final Verification Checklist

### Application Functionality
- [ ] Frontend accessible at http://localhost:30000
- [ ] Backend API responding at http://localhost:8080/api
- [ ] Database contains data from frontend/backend
- [ ] Frontend can call backend API
- [ ] Backend can read/write to database

### Kubernetes Health
- [ ] All pods in Running state: `kubectl get pods -n myapp`
- [ ] All services accessible: `kubectl get svc -n myapp`
- [ ] PersistentVolumes mounted: `kubectl get pv`
- [ ] No errors in pod logs: `kubectl logs deployment/... -n myapp`

### Observability
- [ ] Grafana dashboard showing application metrics
- [ ] Loki displaying application logs
- [ ] Prometheus scraping targets
- [ ] Alerts configurable in Prometheus

### CI/CD Pipeline
- [ ] GitHub Actions building on push
- [ ] Docker images pushing to Docker Hub
- [ ] ArgoCD syncing from Git
- [ ] K8s automatically deploying new images
- [ ] Complete cycle takes <10 minutes

---

## File Checklist

### Frontend (Next.js)
- [ ] frontend/package.json
- [ ] frontend/pages/
- [ ] frontend/components/
- [ ] frontend/.env.local
- [ ] frontend/Dockerfile
- [ ] frontend/next.config.js

### Backend (NestJS)
- [ ] backend/package.json
- [ ] backend/src/main.ts
- [ ] backend/src/app.controller.ts
- [ ] backend/src/database/
- [ ] backend/Dockerfile
- [ ] backend/.env

### Database
- [ ] database/init.sql
- [ ] database/Dockerfile

### Docker
- [ ] docker/Dockerfile.frontend
- [ ] docker/Dockerfile.backend
- [ ] docker/Dockerfile.postgres
- [ ] docker-compose.yml

### Kubernetes
- [ ] k8s/configmap.yaml
- [ ] k8s/secret.yaml
- [ ] k8s/postgresql.yaml
- [ ] k8s/backend.yaml
- [ ] k8s/frontend.yaml

### CI/CD
- [ ] .github/workflows/build-and-push.yml
- [ ] my-k8s-config/ (separate Git repo)

### Documentation
- [ ] README.md (in main repo)
- [ ] DEPLOYMENT.md (setup instructions)

---

## Success Indicators

✅ **Week 1**: All three apps running locally in Docker  
✅ **Week 2**: All three apps running in Kubernetes  
✅ **Week 3**: Monitoring, logging, and GitOps working  
✅ **Week 4**: CI/CD pipeline fully automated  

**Result**: Enterprise-grade application with complete DevOps pipeline! 🚀

---

## Troubleshooting Quick Links

```
Problem                          Solution
─────────────────────────────────────────────────────────
Frontend can't reach backend      Check NEXT_PUBLIC_API_URL
Backend can't reach database      Check DATABASE_HOST in Secret
Pod not starting                  `kubectl describe pod/NAME`
Image not found                   `docker images` or check registry
ArgoCD not syncing                Check git repo path
Logs not in Grafana               Check Loki datasource
Metrics not in Prometheus         Check ServiceMonitor
```

---

**You now have a complete roadmap to production!** 🎉
