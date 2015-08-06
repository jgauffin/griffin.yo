/**
 * Global mappings
 */
export class G {
	static select = new Selector();
	static handle = new EventMapper();

	static render(idOrElem: any, dto: any, directives?: any) {
		const r = new ViewRenderer(idOrElem);
		r.render(dto, directives);
	}
}