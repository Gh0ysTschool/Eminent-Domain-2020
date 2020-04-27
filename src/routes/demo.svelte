<script>
    import PlanetCard from '../components/PlanetCard.svelte';
    let p = {name:'mesa seven tonto',type:'advanced',zones:[{type:'water',filled:false}],conquer_cost:3,settle_cost:5,influence:2,selected:false,icons:{'survey':0,'warfare':0,'colonize':0,'produce':1,'trade':1,'research':0,} };
</script>

<PlanetCard planet={p}/>
<PlanetCard planet={{...p,type:'metallic'}}/>
<PlanetCard planet={{...p,type:'fertile'}}/>