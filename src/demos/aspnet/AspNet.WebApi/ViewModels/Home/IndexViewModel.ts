module DemoApp.Home {
    import Yo = Griffin.Yo;

    export class IndexViewModel implements Yo.IViewModel {
        private directive;

        constructor() {
            var self: IndexViewModel = this;
            this.directive = {
                Notes: {
                    Body: {
                        html(value) {
                            return self.nl2br(value);
                        }
                    }
                }
            };
        }

        getTitle(): string { return "Message app"; }

        activate(context: Griffin.Yo.IActivationContext): void {
            Yo.Http.get('/api/messages', xhr => {
                console.log('rendering');
                context.render({ Notes: xhr['responseJson'] }, this.directive);
                context.resolve();
            }, 'application/json');

        }

        private nl2br(str: string) {
            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
        }


        deactivate() { }
    }
} 