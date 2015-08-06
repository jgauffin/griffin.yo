export interface IViewDirectiveContext {
	activationContext: IActivationContext;
	model: IViewModel;
	view: HTMLElement;
	execute(code: string, customContext: any):any;
};
