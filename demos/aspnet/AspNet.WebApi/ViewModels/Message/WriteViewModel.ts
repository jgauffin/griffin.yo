module DemoApp.Message {
    import Yo = Griffin.Yo;

    export class WriteViewModel implements Yo.IViewModel {
        private context: Yo.IActivationContext;

        getTitle(): string { return "Message app"; }

        activate(context: Yo.IActivationContext): void {
            this.context = context;

            context.handle.click('[name="Save"]', e => {
                this.saveNote();
            });
            context.resolve();
        }

        deactivate() { }

        private saveNote() {
            console.log('here');
            return;
            var data = this.context.readForm('WriteForm');
            Yo.Http.post('/api/message', data, xhr => {
                document.location.hash = '#/';
            });
        }
    }
} 