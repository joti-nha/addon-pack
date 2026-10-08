//Classes
class Vector3 {
    /**
     * 
     * @param {number | Vector3} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x = 0, y = 0, z = 0) {
        if (typeof (x) == "object") {
            this.x = x.x
            this.z = x.z
            this.y = x.y
        } else {
            this.x = x
            this.z = z
            this.y = y
        }
    }

    /**@param {Vector3} vecB  */
    equals(vecB) {
        return this.x == vecB.x && this.z == vecB.z && this.y == vecB.y
    }
    /**@param {Vector3 | number} vecB  */
    add(vecB) {
        if (typeof (vecB) == "number") {
            return new Vector3(this.x + vecB, this.y + vecB, this.z + vecB)
        }
        return new Vector3(this.x + vecB.x, this.y + vecB.y, this.z + vecB.z)
    }
    round() {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z))
    }
    /**@param {Vector3 | number} vecB  */
    sub(vecB) {
        if (typeof (vecB) == "number") {
            return new Vector3(this.x - vecB, this.y - vecB, this.z - vecB)
        }
        return new Vector3(this.x - vecB.x, this.y - vecB.y, this.z - vecB.z)
    }
    /**@param {Vector3 | number} vecB  */
    mul(vecB) {
        if (typeof (vecB) == "number") {
            return new Vector3(this.x * vecB, this.y * vecB, this.z * vecB)
        }
        return new Vector3(this.x * vecB.x, this.y * vecB.y, this.z * vecB.z)
    }
    /**@param {Vector3 | number} vecB  */
    div(vecB) {
        if (typeof (vecB) == "number") {
            return new Vector3(this.x / vecB, this.y / vecB, this.z / vecB)
        }
        return new Vector3(this.x / vecB.x, this.y / vecB.y, this.z / vecB.z)
    }
    /**
     * 
     * @param {Vector3} vecB
     * @returns {Vector3}
     */
    cross(vecB) {
        return new Vector3(
            this.y * vecB.z - this.z * vecB.y,
            this.z * vecB.x - this.x * vecB.z,
            this.x * vecB.y - this.y * vecB.x
        );
    }

    /**
    * 
    * @param {Vector3} target 
    * @param {Vector3} up
    * @returns {Vector3}
    */
    lookAt(target, defaultT = false, up = new Vector3(0, 1, 0)) {
        target = new Vector3(target)
        let dir = target.sub(this).normalize();

        let yaw = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
        let pitch = Math.asin(-dir.y) * (180 / Math.PI);

        let right = up.cross(dir).normalize();
        let newUp = dir.cross(right).normalize();
        let roll = Math.atan2(newUp.y, newUp.x) * (180 / Math.PI);

        let xyzRotation = new Vector3(pitch, yaw, roll);
        let xyRotation = new Vector3(pitch, yaw, 0);
        if (defaultT) {
            return xyzRotation
        } else {
            return xyRotation
        }
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    normalize() {
        const length = this.distance(new Vector3(0, 0, 0));
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }
    normalizeOne() {
        return new Vector3(clamp(Math.floor(this.x), -1, 1), clamp(Math.floor(this.y), -1, 1), clamp(Math.floor(this.z), -1, 1))
    }
    round() {
        const dx = Math.round(this.x)
        const dy = Math.round(this.y)
        const dz = Math.round(this.z)
        return new Vector3(dx, dy, dz)
    }
    floor() {
        const dx = Math.floor(this.x)
        const dy = Math.floor(this.y)
        const dz = Math.floor(this.z)
        return new Vector3(dx, dy, dz)
    }
    distance(vecB, is2d = false) {
        const dx = this.x - vecB.x
        const dy = this.y - vecB.y
        const dz = this.z - vecB.z
        const dist = is2d ? Math.sqrt(dx * dx + dz * dz) : Math.hypot(vecB.x - this.x, vecB.y - this.y, vecB.z - this.z);
        return dist
    }
    /**
     * @param {Vector3} rotation
     * @param {Vector3} pivot
     */
    rotate(rotation, pivot = new Vector3(0, 0, 0)) {
        rotation = new Vector3(rotation.x, rotation.y, rotation.z)
        rotation.x = rotation.x * (Math.PI / 180)
        rotation.y = rotation.y * (Math.PI / 180)
        rotation.z = rotation.z * (Math.PI / 180)
        let cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
        let cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
        let cosZ = Math.cos(rotation.z), sinZ = Math.sin(rotation.z);

        let x = this.x - pivot.x, y = this.y - pivot.y, z = this.z - pivot.z;

        // Rotação em X
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotação em Y
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Rotação em Z
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        return new Vector3(x3 + pivot.x, y3 + pivot.y, z2 + pivot.z)
    }
    length() {
        return Math.sqrt((this.x * this.x) * (this.y * this.y) + (this.z * this.z));
    }
    lerp(vecB, t) {
        const dx = lerp(this.x, vecB.x, t)
        const dy = lerp(this.y, vecB.y, t)
        const dz = lerp(this.z, vecB.z, t)
        return new Vector3(dx, dy, dz)
    }
    clamp(vecMin, vecMax) {
        const min = vecMin.min(vecMax)
        const max = vecMin.max(vecMax)

        const dx = clamp(this.x, min.x, max.x)
        const dy = clamp(this.y, min.y, max.y)
        const dz = clamp(this.z, min.z, max.z)
        return new Vector3(dx, dy, dz)
    }
    /**
    * @param {Vector3} to
    * @param {boolean} returnPoints
    * @param {number} steps
    * @returns {Vector3[] | Vector3}
    */
    bezierTo(to, returnPoints = true, steps = 20) {
        const P0 = this;
        const P3 = new Vector3(to);
        const altura = P0.distance(P3) * 0.25;
        const dir = P3.sub(P0).normalize();
        const perp = new Vector3(0, 1, 0); // direção que você quer que o arco suba
        const P1 = P0.lerp(P3, 0.25).add(perp.mul(altura));
        const P2 = P0.lerp(P3, 0.75).add(perp.mul(altura));

        function bezierPoint(t) {
            const A = P0.lerp(P1, t);
            const B = P1.lerp(P2, t);
            const C = P2.lerp(P3, t);

            const D = A.lerp(B, t);
            const E = B.lerp(C, t);

            return D.lerp(E, t);
        }

        if (returnPoints) {
            const points = [];
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                points.push(bezierPoint(t));
            }
            return points;
        } else {
            return P1;
        }
    }
    min(vecB) {
        return new Vector3(Math.min(vecB.x, this.x), Math.min(vecB.y, this.y), Math.min(vecB.z, this.z))
    }
    max(vecB) {
        return new Vector3(Math.max(this.x, vecB.x), Math.max(this.y, vecB.y), Math.max(this.z, vecB.z))
    }
    getDefault() {
        return { x: this.x, y: this.y, z: this.z }
    }
}
class VolumeArea {
    /**@type {Vector3} */
    #from = undefined
    /**@type {Vector3} */
    #to = undefined
    /**@type {Vector3[]} */
    #positions = []
    /**
     * 
     * @param {Vector3} from 
     * @param {Vector3} to 
     * @param {number} fragments
     */
    constructor(from, to, fragments = 1) {
        this.#from = new Vector3(from)
        this.#to = new Vector3(to)
        //Create
        this.#positions = []
        const min = this.#from.min(this.#to)
        const max = this.#from.max(this.#to)
        for (let y = min.y; y <= max.y; y += fragments) {
            for (let z = min.z; z <= max.z; z += fragments) {
                for (let x = min.x; x <= max.x; x += fragments) {
                    this.#positions.push(new Vector3(x, y, z))
                }
            }
        }
    }
    getPositions() {
        return this.#positions
    }
    getBorder(fragments) {
        const border = []
        const min = this.#from.min(this.#to)
        const max = this.#from.max(this.#to)

        for (let y = min.y; y <= max.y; y += fragments) {
            for (let z = min.z; z <= max.z; z += fragments) {
                for (let x = min.x; x <= max.x; x += fragments) {
                    if ((x == min.x || x == max.x) || (z == min.z || z == max.z) || (y == min.y || y == max.y)) {
                        border.push(new Vector3(x, y, z))
                    }
                }
            }
        }
        return border
    }
    /**
     * @param {Vector3} position
     * @returns {boolean}
     */
    isInside(position) {
        const min = this.#from.min(this.#to)
        const max = this.#from.max(this.#to)
        return (this.#positions.find(pos => pos.distance(position) <= 0.06) != undefined)
    }
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}
function lerp(start_value, end_value, t) {
    const diff = (end_value - start_value)
    return start_value + (diff * t)
}
function generateUid() {
    const length = 6
    const code = "abcdefghijklmnopqrsuvwxyz123456789"
    let text = ""
    for (let i = 1; i <= length; i++) {
        const textS = code[clamp(Math.floor((code.length - 1) * Math.random()), 0, code.length - 1)]
        text += textS
    }
    return text
}
function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min = 0, max = 1) {
    return Math.floor(lerp(min, max, 1 * Math.random()));
}
//Export
export default {
    Vector3: Vector3,
    clamp,
    lerp,
    generateUid,
    getRandomInt,
    getRandomFromArray,
    VolumeArea: VolumeArea
}