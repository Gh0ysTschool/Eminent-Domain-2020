import { S as SvelteComponentDev, i as init, d as dispatch_dev, s as safe_not_equal, v as validate_slots, x as create_component, l as space, y as claim_component, m as claim_space, z as mount_component, a as insert_dev, n as noop, C as transition_in, D as transition_out, E as destroy_component, b as detach_dev } from './client.a5eb345d.js';
import { P as PlanetCard } from './PlanetCard.e40559a5.js';

/* src\routes\demo.svelte generated by Svelte v3.20.1 */

function create_fragment(ctx) {
	let t0;
	let t1;
	let current;

	const planetcard0 = new PlanetCard({
			props: { planet: /*p*/ ctx[0] },
			$$inline: true
		});

	const planetcard1 = new PlanetCard({
			props: {
				planet: { .../*p*/ ctx[0], type: "metallic" }
			},
			$$inline: true
		});

	const planetcard2 = new PlanetCard({
			props: {
				planet: { .../*p*/ ctx[0], type: "fertile" }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(planetcard0.$$.fragment);
			t0 = space();
			create_component(planetcard1.$$.fragment);
			t1 = space();
			create_component(planetcard2.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(planetcard0.$$.fragment, nodes);
			t0 = claim_space(nodes);
			claim_component(planetcard1.$$.fragment, nodes);
			t1 = claim_space(nodes);
			claim_component(planetcard2.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(planetcard0, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(planetcard1, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(planetcard2, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(planetcard0.$$.fragment, local);
			transition_in(planetcard1.$$.fragment, local);
			transition_in(planetcard2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(planetcard0.$$.fragment, local);
			transition_out(planetcard1.$$.fragment, local);
			transition_out(planetcard2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(planetcard0, detaching);
			if (detaching) detach_dev(t0);
			destroy_component(planetcard1, detaching);
			if (detaching) detach_dev(t1);
			destroy_component(planetcard2, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let p = {
		name: "mesa seven tonto",
		type: "advanced",
		zones: [{ type: "water", filled: false }],
		conquer_cost: 3,
		settle_cost: 5,
		influence: 2,
		selected: false,
		icons: {
			"survey": 0,
			"warfare": 0,
			"colonize": 0,
			"produce": 1,
			"trade": 1,
			"research": 0
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Demo> was created with unknown prop '${key}'`);
	});

	let { $$slots = {}, $$scope } = $$props;
	validate_slots("Demo", $$slots, []);
	$$self.$capture_state = () => ({ PlanetCard, p });

	$$self.$inject_state = $$props => {
		if ("p" in $$props) $$invalidate(0, p = $$props.p);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [p];
}

class Demo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Demo",
			options,
			id: create_fragment.name
		});
	}
}

export default Demo;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtby5jYmQ4NThmMy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3JvdXRlcy9kZW1vLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxyXG4gICAgaW1wb3J0IFBsYW5ldENhcmQgZnJvbSAnLi4vY29tcG9uZW50cy9QbGFuZXRDYXJkLnN2ZWx0ZSc7XHJcbiAgICBsZXQgcCA9IHtuYW1lOidtZXNhIHNldmVuIHRvbnRvJyx0eXBlOidhZHZhbmNlZCcsem9uZXM6W3t0eXBlOid3YXRlcicsZmlsbGVkOmZhbHNlfV0sY29ucXVlcl9jb3N0OjMsc2V0dGxlX2Nvc3Q6NSxpbmZsdWVuY2U6MixzZWxlY3RlZDpmYWxzZSxpY29uczp7J3N1cnZleSc6MCwnd2FyZmFyZSc6MCwnY29sb25pemUnOjAsJ3Byb2R1Y2UnOjEsJ3RyYWRlJzoxLCdyZXNlYXJjaCc6MCx9IH07XHJcbjwvc2NyaXB0PlxyXG5cclxuPFBsYW5ldENhcmQgcGxhbmV0PXtwfS8+XHJcbjxQbGFuZXRDYXJkIHBsYW5ldD17ey4uLnAsdHlwZTonbWV0YWxsaWMnfX0vPlxyXG48UGxhbmV0Q2FyZCBwbGFuZXQ9e3suLi5wLHR5cGU6J2ZlcnRpbGUnfX0vPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzswQkFLb0IsR0FBQzs7Ozs7O3VCQUNHLEdBQUMsS0FBQyxJQUFJLEVBQUMsVUFBVTs7Ozs7Ozt1QkFDakIsR0FBQyxLQUFDLElBQUksRUFBQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FMaEMsQ0FBQztFQUFJLElBQUksRUFBQyxrQkFBa0I7RUFBQyxJQUFJLEVBQUMsVUFBVTtFQUFDLEtBQUssS0FBRyxJQUFJLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxLQUFLO0VBQUcsWUFBWSxFQUFDLENBQUM7RUFBQyxXQUFXLEVBQUMsQ0FBQztFQUFDLFNBQVMsRUFBQyxDQUFDO0VBQUMsUUFBUSxFQUFDLEtBQUs7RUFBQyxLQUFLO0dBQUUsUUFBUSxFQUFDLENBQUM7R0FBQyxTQUFTLEVBQUMsQ0FBQztHQUFDLFVBQVUsRUFBQyxDQUFDO0dBQUMsU0FBUyxFQUFDLENBQUM7R0FBQyxPQUFPLEVBQUMsQ0FBQztHQUFDLFVBQVUsRUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
