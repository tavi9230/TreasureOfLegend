import { AniwarsGame } from 'Aniwars/main';

export const Aniwars = {
    template: '<div class="aniwars"></div>',
    mounted: function () {
        $('.btnLogin').addClass('hidden');
        new AniwarsGame();
    }
};