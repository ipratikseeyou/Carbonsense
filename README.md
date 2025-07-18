# Carbonsense

## Overview

Carbonsense is a platform for satellite-verified carbon offset project management and monitoring. It enables users to register forest projects, automatically fetch satellite imagery, estimate carbon credits, and manage project data in real time.

## Features

- Project registration with map-based location selection
- Automated satellite image retrieval for project areas
- Carbon credit estimation based on geospatial data
- Real-time project dashboard and statistics
- Integration with Supabase for data storage
- Scalable architecture for future machine learning and payment features

## Tech Stack

- Frontend: Lovable (no-code platform)
- Database: Supabase (PostgreSQL)
- Satellite Data: Microsoft Planetary Computer API
- (Planned) Machine Learning/Backend: Python (scikit-learn, xgboost, rasterio, earthengine-api)
- (Planned) Payments: Stripe

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ipratikseeyou/Carbonsense.git
   ```
2. Set up Supabase and obtain API keys for all integrations.
3. Connect your Lovable frontend to this repository for version control and collaboration.

## Folder Structure

```
Carbonsense/
├── frontend/           # Lovable project exports or documentation
├── backend/            # (Optional) Python machine learning microservice
├── docs/               # Documentation and API references
├── .env.example        # Environment variable template
└── README.md
```

## License

This project is licensed under the MIT License.
