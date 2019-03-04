import Vue from 'vue';
import VueRouter from 'vue-router';
import { Error } from 'Shared/error';
import { LandingContainer } from 'Landing/landingContainer';
import { HomeContainer } from 'Home/homeContainer';
import { Aniwars } from 'Aniwars/aniwars';
import { TreasureOfLegend } from 'TreasureOfLegend/treasureOfLegend';

Vue.use(VueRouter);

export const router = new VueRouter({
    history: true,
    root: '/TreasureOfLegend.Web/vuerouting',
    routes: [
        {
			path: '/',
			name: 'Landing',
			component: LandingContainer
        },
        {
            path: '/Home',
            name: 'Home',
            component: HomeContainer
        },
        {
            path: '/Aniwars',
            name: 'Aniwars',
            component: Aniwars
        },
        {
            path: '/TreasureOfLegend',
            name: 'TreasureOfLegend',
            component: TreasureOfLegend
        },
        {
            path: '*',
            name: 'NotFound',
            component: Error
        }
    ],

    // Active class for non-exact links.
    linkActiveClass: 'active',

    // Active class for *exact* links.
    linkExactActiveClass: 'active'
});