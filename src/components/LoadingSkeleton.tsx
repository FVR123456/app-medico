import { Skeleton, Card, CardContent, Grid, Stack, Box } from '@mui/material';

export const AppointmentCardSkeleton = () => (
  <Card>
    <CardContent>
      <Stack spacing={2}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={24} />
        <Skeleton variant="rectangular" width="100%" height={60} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export const PatientCardSkeleton = () => (
  <Card>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, gap: 2 }}>
      <Skeleton variant="circular" width={64} height={64} />
      <Stack spacing={1} alignItems="center" width="100%">
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="90%" height={20} />
      </Stack>
    </CardContent>
  </Card>
);

export const StatCardSkeleton = () => (
  <Card>
    <CardContent sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="50%" height={40} />
        <Skeleton variant="text" width="70%" height={20} />
      </Stack>
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => (
  <Box>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2].map((i) => (
        <Grid key={i} size={{ xs: 6, md: 3 }}>
          <StatCardSkeleton />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={150} height={32} />
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton variant="rectangular" width="100%" height={80} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </Stack>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardSkeleton;
