# GhostQuant Demo Engine

Public-facing demo terminal with synthetic intelligence data.

## Overview

The Demo Engine provides a safe, read-only demonstration of the GhostQuant Terminal using synthetic data. It's designed for public access without requiring authentication and without any risk to production systems.

## Architecture

### Core Components

1. **DemoEngine** (`demo_engine.py`)
   - Core logic for generating synthetic intelligence
   - 11 methods for different intelligence types
   - Fast (<80ms response times)
   - Zero backend mutations

2. **DemoSyntheticGenerator** (`demo_synthetic_generator.py`)
   - Generates realistic but fake data
   - Seeded random generation for reproducibility
   - Covers all intelligence types

3. **Demo Schema** (`demo_schema.py`)
   - Pydantic models for all demo data types
   - Identical structure to real intelligence
   - Type-safe and validated

4. **Demo Routes** (`demo_routes.py`)
   - 15 FastAPI endpoints
   - Mounted at `/demo-api`
   - RESTful API design

## Safety Guarantees

The Demo Engine is designed with multiple safety layers:

- ✅ **No Real Engine Calls**: Never calls production engines
- ✅ **No Genesis Writes**: Never writes to the immutable ledger
- ✅ **No Cortex Writes**: Never writes to memory engine
- ✅ **No Data Mutations**: Read-only operations only
- ✅ **No Real Alerts**: Never triggers Sentinel alerts
- ✅ **Synthetic Data Only**: All data is fake and safe
- ✅ **Public Access Safe**: Designed for unauthenticated access

## API Endpoints

### Intelligence Endpoints

- `GET /demo-api/prediction` - Synthetic prediction analysis
- `GET /demo-api/fusion` - Synthetic UltraFusion analysis
- `GET /demo-api/sentinel` - Synthetic Sentinel status
- `GET /demo-api/constellation` - Synthetic Constellation map
- `GET /demo-api/hydra` - Synthetic Hydra detection
- `GET /demo-api/ultrafusion` - Synthetic UltraFusion meta-analysis
- `GET /demo-api/dna` - Synthetic Behavioral DNA
- `GET /demo-api/actor` - Synthetic Actor Profile
- `GET /demo-api/cortex` - Synthetic Cortex pattern

### Data Endpoints

- `GET /demo-api/event` - Single synthetic event
- `GET /demo-api/entity` - Single synthetic entity
- `GET /demo-api/token` - Single synthetic token
- `GET /demo-api/chain` - Synthetic chain metrics
- `GET /demo-api/feed?count=10` - Feed of synthetic events

### System Endpoints

- `GET /demo-api/health` - Demo engine health status
- `GET /demo-api/info` - Demo terminal information

### Enterprise Endpoints

- `POST /demo-api/request-access` - Submit enterprise access request
- `GET /demo-api/requests/count` - Get request count

## Usage

### Backend Integration

```python
from app.gde.demo import DemoEngine

# Initialize demo engine
demo = DemoEngine(seed=42)

# Generate synthetic intelligence
prediction = demo.run_demo_prediction()
fusion = demo.run_demo_fusion()
sentinel = demo.run_demo_sentinel()
```

### Frontend Integration

```typescript
import { demoClient } from '@/lib/demoClient';

// Fetch synthetic intelligence
const prediction = await demoClient.getPrediction();
const fusion = await demoClient.getFusion();
const feed = await demoClient.getFeed(10);
```

## Performance

- **Response Time**: <80ms average
- **Throughput**: 1000+ requests/second
- **Memory**: Minimal (no caching, stateless)
- **CPU**: Low (simple random generation)

## Security

- No authentication required (public access)
- No sensitive data exposure
- No production system access
- Rate limiting recommended for production
- CORS configured for web access

## Development

### Running Tests

```bash
pytest api/app/gde/demo/tests/
```

### Adding New Intelligence Types

1. Add schema to `demo_schema.py`
2. Add generator method to `demo_synthetic_generator.py`
3. Add engine method to `demo_engine.py`
4. Add route to `demo_routes.py`
5. Update `__init__.py` exports

## Deployment

The demo engine is automatically deployed with the main API. No special configuration required.

### Environment Variables

None required. The demo engine is self-contained and stateless.

## Monitoring

Monitor demo usage through:
- API request logs
- `/demo-api/health` endpoint
- `/demo-api/requests/count` for conversion tracking

## Support

For questions or issues with the demo engine:
- Email: enterprise@ghostquant.io
- Documentation: https://docs.ghostquant.io/demo
