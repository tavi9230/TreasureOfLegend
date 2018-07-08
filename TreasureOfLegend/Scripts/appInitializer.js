import Vue from 'vue';
import { ModalContainer } from 'Shared/modalContainer';
import { MainContainer } from 'mainContainer';
import { WindowEvents } from 'Shared/windowEvents';

window.WindowEvents = WindowEvents;
window.Emitter = new Vue();
Emitter.isLoggedIn = false;
window.Landing = new Vue(MainContainer);
window.ModalContainer = new Vue(ModalContainer);