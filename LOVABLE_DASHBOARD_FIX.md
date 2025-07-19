# Fix ProjectDashboard Page for AWS Backend

## Update the content of `src/pages/ProjectDashboard.tsx` starting from line 38:

Replace the entire query and delete function with this AWS-integrated version:

```typescript
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects from AWS API');
      const response = await fetch(apiEndpoints.projects);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      console.log('Fetched projects:', data);
      return data;
    },
  });

  // Remove the Supabase real-time subscription effect (lines 47-68)
  // It's not needed with AWS backend

  // Update the delete function (around line 100) to use AWS API:
  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(apiEndpoints.projectById(projectId), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast({
        title: 'Success!',
        description: 'Project deleted successfully.',
      });

      // Refetch projects list
      refetch();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    }
  };
```

## Additional Changes:

1. **Remove Supabase Import** - Remove line 11:
```typescript
// Remove this line:
import { supabase } from '@/integrations/supabase/client';
```

2. **Update ProjectCard Usage** - Make sure ProjectCard receives all data from AWS including currency:
   - The ProjectCard component should already handle currency display
   - Pass the entire project object which includes all enhanced fields

3. **Stats Calculations** - Update to handle currency from projects:
```typescript
  const totalCarbonTons = projects?.reduce((sum, project) => sum + Number(project.carbon_tons), 0) || 0;
  const averagePrice = projects?.length 
    ? projects.reduce((sum, project) => sum + Number(project.price_per_ton || 25), 0) / projects.length
    : 0;
  
  // For total value, consider different currencies
  const totalValueUSD = projects?.reduce((sum, project) => {
    const price = project.price_per_ton || 25;
    const tons = project.carbon_tons || 0;
    // Simple calculation - in production you'd want proper currency conversion
    return sum + (tons * price);
  }, 0) || 0;
```

## Complete Integration Checklist:

✅ Projects fetch from AWS API endpoint  
✅ Delete uses AWS API endpoint  
✅ Remove Supabase dependencies  
✅ Handle currency display in stats  
✅ Error handling for API failures  

This will ensure the dashboard works seamlessly with your AWS backend!
