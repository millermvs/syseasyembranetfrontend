import { Routes } from '@angular/router';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Redes } from './components/pages/redes/redes';
import { Equipamentos } from './components/pages/equipamentos/equipamentos';

export const routes: Routes = [

    {
        path: 'pages/dashboard',
        component: Dashboard
    },
    {
        path: 'pages/redes',
        component: Redes
    },
    {
        path: 'pages/equipamentos',
        component: Equipamentos
    },

    {
        path:'', pathMatch: 'full', redirectTo: 'pages/dashboard'
    }

];
