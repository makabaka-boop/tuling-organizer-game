import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';
import { ResultPage } from '../pages/ResultPage';
import { TutorialPage } from '../pages/TutorialPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/game/:levelId',
    element: <GamePage />,
  },
  {
    path: '/result',
    element: <ResultPage />,
  },
  {
    path: '/tutorial',
    element: <TutorialPage />,
  },
]);
