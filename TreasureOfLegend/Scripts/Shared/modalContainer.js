export const ModalContainer = {
    el: '.modal',
    template:
        '<div v-if="modalComponent" class="modal" v-on:click="closeModal">' +
            '<component :is="modalComponent" :options="options"></component>' +
        '</div>',

    data: function () {
        return {
            modalComponent: undefined
        };
    },

    methods: {
        displayModal: function (component, options) {
            this.modalComponent = component;
            this.options = options;
        },
        closeModal: function (event) {
            if (!event || event.target.className === 'modal') {
                this.modalComponent = undefined;
                Emitter.$emit('modalClosed');
            }
        }
    }
};