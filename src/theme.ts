import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
     palette: {
          primary: {
               main: '#2563eb', // Modern vibrant blue (Tailwind-like)
               light: '#60a5fa',
               dark: '#1e40af',
               contrastText: '#ffffff',
          },
          secondary: {
               main: '#10b981', // Emerald teal
               light: '#34d399',
               dark: '#059669',
               contrastText: '#ffffff',
          },
          background: {
               default: '#f8fafc', // Slate-50
               paper: '#ffffff',
          },
          text: {
               primary: '#1e293b', // Slate-800
               secondary: '#64748b', // Slate-500
          },
     },
     typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 700, letterSpacing: '-0.025em' },
          h2: { fontWeight: 700, letterSpacing: '-0.025em' },
          h3: { fontWeight: 600, letterSpacing: '-0.025em' },
          h4: { fontWeight: 600, letterSpacing: '-0.025em' },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { fontWeight: 600, textTransform: 'none' },
     },
     shape: {
          borderRadius: 16, // More rounded corners for 2025 feel
     },
     components: {
          MuiAppBar: {
               styleOverrides: {
                    root: {
                         backgroundColor: alpha('#ffffff', 0.8), // Glassmorphism base
                         backdropFilter: 'blur(12px)',
                         color: '#1e293b',
                         boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    },
               },
          },
          MuiButton: {
               styleOverrides: {
                    root: {
                         borderRadius: 12,
                         padding: '10px 24px',
                         boxShadow: 'none',
                         '&:hover': {
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                         },
                    },
                    containedPrimary: {
                         background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    },
                    containedSecondary: {
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    },
               },
          },
          MuiCard: {
               styleOverrides: {
                    root: {
                         borderRadius: 20,
                         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                         transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                         '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                         },
                    },
               },
          },
          MuiPaper: {
               styleOverrides: {
                    root: {
                         backgroundImage: 'none',
                    },
               },
          },
          MuiTextField: {
               styleOverrides: {
                    root: {
                         '& .MuiOutlinedInput-root': {
                              borderRadius: 12,
                         },
                    },
               },
          },
          MuiChip: {
               styleOverrides: {
                    root: {
                         borderRadius: 8,
                         fontWeight: 500,
                    },
               },
          },
     },
});

export default theme;
