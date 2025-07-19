# Lovable Frontend - AWS Backend Integration Guide

## Overview
This guide provides step-by-step instructions for integrating the Lovable frontend with the AWS-deployed Carbonsense backend API.

## Backend API Details

### Production API Endpoint
```
https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod
```

### API Documentation
- Swagger UI: `https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/docs`
- OpenAPI JSON: `https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/openapi.json`

## Integration Steps

### 1. Environment Configuration

In your Lovable project settings, add the following environment variable:

```
VITE_API_URL=https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod
```

**Note**: The API configuration in `src/config/api.ts` already uses this environment variable with the AWS endpoint as a fallback, so no code changes are needed.

### 2. API Endpoints Reference

All API endpoints are prefixed with the base URL above. Here are the available endpoints:

#### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create a new project
- `GET /projects/{id}` - Get project by ID
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `POST /projects/{id}/analyze` - Analyze project (triggers satellite and API analysis)
- `GET /projects/{id}/report` - Download project PDF report

#### Currencies
- `GET /currencies` - Get supported currencies list

#### Health Check
- `GET /` - API health check and version info

### 3. Required Frontend Files

Ensure these files are present in your Lovable project (they should already be in the repository):

```
src/
├── config/
│   └── api.ts                    # API configuration (already set up)
├── components/
│   ├── ProjectCard.tsx          # Project display component
│   ├── CurrencySelector.tsx     # Currency selection component
│   └── MapLocationPicker.tsx    # Fixed draggable map pin
├── hooks/
│   └── useCurrencyConversion.ts # Currency conversion hook
└── pages/
    ├── ProjectDashboard.tsx     # Main dashboard
    └── ProjectUploadEnhanced.tsx # Enhanced upload with all fields
```

### 4. Project Data Structure

The backend expects projects with this structure:

```typescript
interface Project {
  id?: string;
  name: string;
  coordinates: string;  // Format: "latitude,longitude"
  carbon_tons: number;
  price_per_ton?: number;
  currency?: string;    // ISO currency code (USD, EUR, GBP, etc.)
  
  // Enhanced fields
  project_area?: number;
  forest_type?: string;
  methodology?: string;
  baseline_methodology?: string;
  verification_standard?: string;
  verification_body?: string;
  uncertainty_percentage?: number;
  developer_name?: string;
  stakeholder_name?: string;
  stakeholder_contact?: string;
  satellite_image_url?: string;
  
  // Auto-generated fields
  created_at?: string;
  updated_at?: string;
}
```

### 5. API Request Examples

#### Creating a Project
```javascript
const response = await fetch(`${API_CONFIG.BACKEND_URL}/projects`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Amazon Rainforest Project",
    coordinates: "-3.4653,-62.2159",
    carbon_tons: 50000,
    price_per_ton: 25,
    currency: "USD",
    forest_type: "Tropical Rainforest",
    project_area: 1000,
    methodology: "REDD+",
    developer_name: "Green Earth Initiative"
  })
});
```

#### Analyzing a Project
```javascript
const response = await fetch(`${API_CONFIG.BACKEND_URL}/projects/${projectId}/analyze`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

This triggers:
- NASA FIRMS fire detection analysis
- OpenWeather climate data retrieval
- Satellite imagery processing
- Returns enhanced project data

#### Downloading PDF Report
```javascript
const response = await fetch(`${API_CONFIG.BACKEND_URL}/projects/${projectId}/report`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `project-${projectId}-report.pdf`;
a.click();
```

### 6. Important Notes

#### CORS
The AWS API Gateway is configured to handle CORS. All endpoints return appropriate CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

#### Error Handling
The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message here"
}
```

#### Timeouts
- The API configuration includes a 60-second timeout for long-running operations
- Project analysis may take 10-30 seconds due to external API calls

#### Rate Limits
- No specific rate limits are enforced, but be mindful of external API quotas
- NASA FIRMS and OpenWeather have their own rate limits

### 7. Supabase Integration

The frontend still uses Supabase for:
- Mapbox token retrieval (edge function)
- Real-time project updates (optional)

Ensure these Supabase configurations remain intact.

### 8. Testing the Integration

1. **Health Check**:
   ```bash
   curl https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/
   ```
   Should return:
   ```json
   {
     "message": "Carbonsense API",
     "version": "1.0.0",
     "stage": "Prod"
   }
   ```

2. **Get Projects**:
   ```bash
   curl https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/projects
   ```

3. **Test from Browser Console**:
   ```javascript
   fetch('https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/projects')
     .then(r => r.json())
     .then(console.log)
   ```

### 9. Troubleshooting

#### If API calls fail:
1. Check browser console for CORS errors
2. Verify the API URL doesn't have trailing slashes where not needed
3. Ensure JSON payloads are properly formatted
4. Check network tab for actual response details

#### If map pin doesn't work:
- The MapLocationPicker component has been fixed to properly handle dragging
- Ensure Mapbox token is available from Supabase edge function

#### If PDF download fails:
- Check that the project has been analyzed first
- Ensure browser allows file downloads
- Check console for any blob handling errors

### 10. Deployment Checklist

Before deploying to Lovable:
- [ ] Verify all frontend files are committed to the repository
- [ ] Set VITE_API_URL environment variable in Lovable
- [ ] Test API connectivity from browser console
- [ ] Verify Mapbox token edge function is working
- [ ] Test project creation, analysis, and PDF download flows
- [ ] Check that currency conversion is working properly

## Support

For backend issues or API questions:
- API Docs: `https://kvu6v1r4mk.execute-api.us-east-1.amazonaws.com/Prod/docs`
- The backend includes comprehensive logging in AWS CloudWatch

## Backend Architecture

The AWS backend includes:
- AWS Lambda function for API processing
- API Gateway for HTTPS endpoints
- Integration with NASA FIRMS for fire detection
- OpenWeather API for climate data
- PDF generation with satellite imagery
- Multi-currency support
- Comprehensive project analysis

All API keys and secrets are securely stored in AWS Lambda environment variables.
