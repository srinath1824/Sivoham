# Test User & Admin Login Details

## User Registration
- Go to the **Courses** page (`/courses`).
- Register with any name and a valid email address (e.g.,
  - Name: `Test User`
  - Email: `testuser@example.com`
)
- No password is required for user login; registration info is stored in localStorage and/or the backend.

## Admin Login (if implemented)
- Email: `admin@example.com`
- Password: `admin123`

> If admin login is not yet implemented, you may need to create an admin user directly in the database or via a special registration flow.

## Summary Table

| Role   | Name       | Email                | Password   |
|--------|------------|----------------------|------------|
| User   | Test User  | testuser@example.com | (none)     |
| Admin* | Admin      | admin@example.com    | admin123   |

> *If admin login is implemented and seeded.

---

## Deployment Guide: Docker & Kubernetes

### 1. Environment Variables
Set these in your deployment environment (Docker/K8s secrets, .env, or cloud config):

- `USE_STATELESS_MODE=true`            # Enable stateless backend
- `ENABLE_NEWRELIC=true`               # Enable New Relic monitoring
- `NEW_RELIC_LICENSE_KEY=your_key`     # Your New Relic license key
- `NEW_RELIC_APP_NAME=your_app_name`   # Your app name in New Relic
- `MONGO_URI=your_mongodb_uri`         # MongoDB connection string
- `JWT_SECRET=your_jwt_secret`         # JWT secret for auth
- `PORT=5000`                          # Backend port (optional)

For frontend feature flags, edit:
- `src/pages/Courses.tsx` (`USE_CDN_HLS`)
- `src/components/courses/VideoPlayer.tsx` (`USE_HLS_PLAYER`)

### 2. Docker Deployment

**Dockerfile (backend example):**
```Dockerfile
FROM node:18
WORKDIR /app
COPY backend ./backend
COPY package*.json ./
RUN npm install --prefix backend
ENV NODE_ENV=production
ENV USE_STATELESS_MODE=true
ENV ENABLE_NEWRELIC=true
ENV NEW_RELIC_LICENSE_KEY=your_key
ENV NEW_RELIC_APP_NAME=your_app_name
ENV MONGO_URI=your_mongodb_uri
ENV JWT_SECRET=your_jwt_secret
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

**Build & Run:**
```sh
docker build -t sivoham-backend .
docker run -d -p 5000:5000 --env-file .env sivoham-backend
```

### 3. Kubernetes Deployment

**Sample Deployment YAML:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sivoham-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sivoham-backend
  template:
    metadata:
      labels:
        app: sivoham-backend
    spec:
      containers:
      - name: backend
        image: your-docker-repo/sivoham-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: USE_STATELESS_MODE
          value: "true"
        - name: ENABLE_NEWRELIC
          value: "true"
        - name: NEW_RELIC_LICENSE_KEY
          valueFrom:
            secretKeyRef:
              name: newrelic-secret
              key: license_key
        - name: NEW_RELIC_APP_NAME
          value: "Sivoham Backend"
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
---
apiVersion: v1
kind: Service
metadata:
  name: sivoham-backend
spec:
  type: ClusterIP
  selector:
    app: sivoham-backend
  ports:
    - port: 5000
      targetPort: 5000
```

**Create secrets:**
```sh
kubectl create secret generic newrelic-secret --from-literal=license_key=your_key
kubectl create secret generic mongo-secret --from-literal=uri=your_mongodb_uri
kubectl create secret generic jwt-secret --from-literal=secret=your_jwt_secret
```

**Apply deployment:**
```sh
kubectl apply -f deployment.yaml
```

### 4. Health Checks & Auto-Scaling
- Use `/api/health` for Kubernetes liveness/readiness probes and cloud load balancers.
- Set up Horizontal Pod Autoscaler (HPA) in Kubernetes for auto-scaling based on CPU/memory/requests.

--- 