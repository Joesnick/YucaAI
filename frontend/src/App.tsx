import { AnalyzeButton } from './components/classification/AnalyzeButton';
import { ResultPanel } from './components/classification/ResultPanel';
import { ImageUploadCard } from './components/image-upload/ImageUploadCard';
import { AppHeader } from './components/layout/AppHeader';
import { Layout } from './components/layout/Layout';

export default function App() {
  return <Layout><AppHeader /><ImageUploadCard /><AnalyzeButton /><ResultPanel /></Layout>;
}
