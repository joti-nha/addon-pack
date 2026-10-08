import { world, system } from '@minecraft/server';

const villager_names = [
	"Alaric", "Alke", "Astrid", "Adan", "Aimar", "Alarico", "Aldo", "Alvaro",
	"Amalio", "Amando", "Anselmo", "Antonio", "Arnaldo", "Filipe", "Arturo",
	"Balduino", "Baltasar", "Bautista", "Beltran", "Benito", "Bernardo", "João",
	"Bosco", "Bruno", "Caleb", "Victor", "Carlos", "Casimiro", "Castor",
	"Celestino", "Cesar", "Cipriano", "Claudio", "Clemente", "Clodoveo",
	"Conrado", "Constantino", "Cosme", "Crispin", "Cristobal", "Damian",
	"Daniel", "David", "Diego", "Dionisio", "Domingo", "Eduardo", "Egidio",
	"Elias", "Enrique", "Ernesto", "Esteban", "Eugenio", "Eusebio", "Ezequiel",
	"Fabian", "Facundo", "Federico", "Felipe", "Felix", "Fernando", "Francisco",
	"Fulgencio", "Gabriel", "Gaspar", "Genaro", "Gerardo", "German", "Gervasio",
	"Gilberto", "Gil", "Gonzalo", "Gregorio", "Guillermo", "Guido", "Gustavo",
	"Hector", "Heriberto", "Hernando", "Hermes", "Hilario", "Hipolito", "Horacio",
	"Hugo", "Humberto", "Ignacio", "Isidro", "Jacinto", "Jaime", "Javier",
	"Jeronimo", "Jesus", "Joaquin", "Jorge", "Jean", "Juan", "Julian", "Julio",
	"Jerry", "Ladislao", "Lambertino", "Leonardo", "Leopoldo", "Lorenzo", "Lucas",
	"Luciano", "Luis", "Macario", "Marcelo", "Marcos", "Mariano", "Mario",
	"Martin", "Mateo", "Matias", "Mauricio", "Maximiliano", "Melchor", "Miguel",
	"Moises", "Modesto", "Nicolas", "Norberto", "Octavio", "Odon", "Olegario",
	"Oliverio", "Omar", "Onofre", "Orencio", "Orlando", "Oscar", "Osmundo",
	"Oton", "Pablo", "Pascual", "Patricio", "Pedro", "Pelayo", "Perfecto",
	"Petronio", "Pio", "Placido", "Policarpo", "Ponciano", "Prudencio", "Rafael",
	"Raimundo", "Ramiro", "Ramon", "Raul", "Renato", "Ricardo", "Roberto",
	"Rodrigo", "Rogerio", "Rolando", "Roman", "Roque", "Ruben", "Rufino",
	"Salvador", "Samuel", "Sancho", "Santiago", "Santos", "Sebastian", "Segundo",
	"Sergio", "Severiano", "Silvestre", "Simon", "Sixto", "Solano", "Teodoro",
	"Tomas", "Toribio", "Tristan", "Urbano", "Valentin", "Valerio", "Vicente",
	"Victor", "Vidal", "Virgilio", "Wenceslao", "Abril", "Agata", "Aldonza",
	"Alejandra", "Alicia", "Alina", "Alma", "Amalia", "Ana", "Andrea", "Angela",
	"Anita", "Anna", "Antonia", "Arabela", "Beatriz", "Belinda", "Berta",
	"Blanca", "Camila", "Candelaria", "Carlota", "Carmen", "Carolina", "Casilda",
	"Catalina", "Cecilia", "Celestina", "Clara", "Claudia", "Clemencia",
	"Constanza", "Cora", "Cristina", "Damiana", "Daniela", "Delia", "Diana",
	"Dolores", "Dorotea", "Elena", "Elisa", "Eloisa", "Emilia", "Enriqueta",
	"Esmeralda", "Esperanza", "Estefania", "Eugenia", "Eulalia", "Eva", "Fabiola",
	"Felicia", "Fernanda", "Florencia", "Francisca", "Gabriela", "Genoveva",
	"Georgina", "Gertrudis", "Gloria", "Graciela", "Guadalupe", "Hortensia",
	"Huberta", "Kaua", "Ines", "Irene", "Isabel", "Isabella", "Jacinta", "Juana",
	"Julia", "Juliana", "Julieta", "Justina", "Laura", "Leticia", "Lidia",
	"Liliana", "Lola", "Lorenza", "Luisa", "Lucinda", "Lucia", "Lucila"
];

world.afterEvents.entitySpawn.subscribe(event => {
	const spawnedEntity = event.entity;

	// Filtra rapidamente se é um villager antes de agendar o delay
	if (spawnedEntity?.typeId === "minecraft:villager_v2") {

		// Salva o ID da entidade para buscá-la de forma segura depois
		const entityId = spawnedEntity.id;

		system.run(() => {
			try {
				// Busca uma referência "fresca" e atualizada do Villager direto do mundo
				const freshEntity = world.getEntity(entityId);

				// Se ele existir no mundo e ainda não tiver nome, nós renomeamos
				if (freshEntity && !freshEntity.nameTag) {
					const randomName = villager_names[Math.floor(Math.random() * villager_names.length)];
					freshEntity.nameTag = randomName;
				}
			} catch (e) {
				console.warn(`[Common Sense] Erro ao renomear villager: ${e}`);
			}
		});
	}
});