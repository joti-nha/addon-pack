export function Vector(x=0,y=0,z=0){
    const v1 = typeof(x) == "object" ? x : {x,y,z}
    const Actions = {
        add: (v2) => {
            let Vec = { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }
            return Vector(Vec.x,Vec.y,Vec.z)
        },
        mul: (v2) => {
            if(typeof(v2) == "number"){
                return Vector(v1.x * v2, v1.y * v2, v1.z * v2)
            }else if(typeof(v2) == "object"){
                return Vector(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z)
            }
        },
        distance: (v2)=>{
            var distance = Math.sqrt(
                Math.pow((v2.x - v1.x), 2) +
                Math.pow((v2.y - v1.y), 2) +
                Math.pow((v2.z - v1.z), 2)
            );
            return distance;
        },
        len: Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z),
        dot: (v2)=>{
            return (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z)
        },
        normalized: ()=>{
            let len = Actions.len
            return { x: v1.x / length, y: v1.y / length, z: v1.z / length }
        },
        direction: (v2)=>{
            const length = Vector(v2).len
            const Dif = Vector(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
            return Dif.normalized();
        },
        x,
        y,
        z
    }
    return Actions
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function VectorDirection(v1, v2) {
    const Dif = Vector(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
    return Dif.normalized();
}