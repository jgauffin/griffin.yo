module DemoApp.Message {
    import Yo = Griffin.Yo;

    export class ViewViewModel implements Yo.IViewModel {
        getTitle(): string { return "Write message"; }

        activate(context: Griffin.Yo.IActivationContext): void {
            Yo.Http.get('/api/messages', result => {
                context.render(result);
                context.resolve();
            }, 'application/json');

        }

        deactivate() {}
    }
} 