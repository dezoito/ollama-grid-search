import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import Layout from "./Layout";
import { ThemeProvider } from "./components/theme-provider";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Layout />
      </ThemeProvider>

      <ReactQueryDevtools initialIsOpen={false} />

    </QueryClientProvider>
  );
}

export default App;
