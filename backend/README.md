# CycleWeave FastAPI Backend

Backend API for the CycleWeave LCA Command Center.

## Tech Stack
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database (via Motor async driver)
- **Pydantic** - Data validation

## Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 3. Start MongoDB
Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud hosting.

### 4. Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### LCA Assessments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lca/` | Create new LCA |
| GET | `/api/lca/` | List all LCAs |
| GET | `/api/lca/{id}` | Get LCA by ID |
| PUT | `/api/lca/{id}` | Update LCA |
| DELETE | `/api/lca/{id}` | Delete LCA |
| POST | `/api/lca/{id}/simulate` | Simulate changes |

### Scanner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scanner/analyze` | Analyze scrap (JSON) |
| POST | `/api/scanner/upload` | Upload & analyze image |
| GET | `/api/scanner/` | List scan results |
| GET | `/api/scanner/{id}` | Get scan by ID |
| POST | `/api/scanner/{scan_id}/apply/{lca_id}` | Apply scan to LCA |

### AI Doctor
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctor/analyze` | Run AI analysis |
| GET | `/api/doctor/` | List all analyses |
| GET | `/api/doctor/{id}` | Get analysis by ID |
| GET | `/api/doctor/lca/{lca_id}` | Get analyses for LCA |
| POST | `/api/doctor/{id}/apply/{improvement_id}` | Apply improvement |

### Material Passport
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/passport/` | Generate passport |
| GET | `/api/passport/` | List all passports |
| GET | `/api/passport/{id}` | Get passport |
| GET | `/api/passport/{id}/full` | Get full passport with LCA data |
| GET | `/api/passport/lca/{lca_id}` | Get passports for LCA |
| DELETE | `/api/passport/{id}` | Delete passport |

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Render
1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## MongoDB Collections
- `lca_assessments` - LCA data records
- `scan_results` - Scrap scanner results  
- `doctor_analyses` - AI Doctor analyses
- `passports` - Material Passports
