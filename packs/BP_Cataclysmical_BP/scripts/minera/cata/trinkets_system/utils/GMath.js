const DEGRESS_TO_RADIANS = Math.PI/180.0;
const RADIANS_TO_DEGRESS = 180 / Math.PI;

class MathUtils {
    static normalizeDegress(angle){
        if(angle < 0){
            while(angle < -360) angle += 360;
            angle = 360 - angle;
        } else {
            while(angle > 360) angle -= 360;
        }
        return angle;
    }
}

class Quaternion {
    x = 0;
    y = 0;
    z = 0;
    w = 0;
    Quaternion(x=0,y=0,z=0,w=1.0){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    fromEuler(euler){
        const x = euler.x;
        const y = euler.y;
        const z = euler.z;
        
        const cos = Math.cos;
        const sin = Math.sin;

		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );

		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
    }
}

class Vector2 {
    x = 0.0;
    y = 0.0;
    constructor(x = 0.0, y = 0.0){
        this.x = x;
        this.y = y;
    }

    /**
     *@param {number} angle
     *@param {number} range
     */
    toAngle(range, angle){
        this.x = range;
        this.y = 0;
        this.rotate(angle);
        return this;
    }

    set(x = this.x, y = this.y){
        this.x = x;
        this.y = y;
        return this;
    }
    add(vec){
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }
    sub(vec){
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
    dot(vec){
        return this.x * vec.x + this.y * vec.y;
    }
    equals(vec){
        return this.x == vec.x && this.y == vec.y;
    }
    distance(x, y){
        return  Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
    }

    getDegress(){
        return Math.atan2(this.y, this.x) * RADIANS_TO_DEGRESS;
    }

    rotateRad(radians){
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        
        let x = this.x * cos + this.y * sin;
        let y = this.x * sin - this.y * cos;

        this.x = x;
        this.y = y;
        return this;
    }

    multiplyScalar(scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        return this;
    }
    
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }
    normalizeOne(){
        let magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
        let x = this.x != 0 ? this.x / magnitude : 0
        let y = this.y != 0 ? this.y / magnitude : 0
        return new Vector2(x, y);
    }
    normalize() {
        return this.divideScalar(this.length() || 1 );
    }

    divideScalar(scale) {
        return this.multiplyScalar(1.0 / scale);
    }

    length() {
        return Math.sqrt((this.x * this.x) * (this.y * this.y));
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    /** @param {Vector3} vec2  */
    multiply(vec2) {
        this.x *= vec2.x;
        this.y *= vec2.y;

        return this;
    }

    /** @param {Vector3} vec2  */
    divide(vec2) {
        this.x /= vec2.x;
        this.y /= vec2.y;

        return this;
    }

    /**
     * @param {Vector2} pivot
     * @param {number} angle  
     * */
    rotate(angle, pivot=ZERO_VEC2){
        this.x -= pivot.x;
        this.y -= pivot.y;

        this.rotateRad(angle * DEGRESS_TO_RADIANS );

        this.x += pivot.x;
        this.y += pivot.y;
        return this;
    }
    clone(){
        return new Vector2(this.x, this.y)
    }
}


class Vector3 {
    x = 0.0;
    y = 0.0;
    z = 0.0;
    _q = new Quaternion();

     /**
     * 
     * @param {Vector3 | number} x 
     * @param {number} y 
     * @param {number} z 
     */
     constructor(x = 0, y = 0, z = 0) {
        if (typeof (x) == "object") {
            this.x = x.x != undefined ? x.x : 0
            this.y = x.y != undefined ? x.y : 0
            this.z = x.z != undefined ? x.z : 0
        } else if (typeof (x) == "number") {
            this.x = x
            this.y = y
            this.z = z
        }
    }

    add(vec){
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }
    sub(vec){
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }
    linearLerp(vec,t){
        return new Vector3(this.x + (vec.x - this.x) * t, this.y + (vec.y - this.y) * t, this.z + (vec.z - this.z) * t)
    }
    dot(vec){
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }
    equals(vec){
        return this.x == vec.x && this.y == vec.y && this.z == vec.z;
    }
    
    distance(VectorB, is2d){
        const dx = this.x - VectorB.x
        const dy = this.y - VectorB.y
        const dz = this.z - VectorB.z
        if(is2d){
            return Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
        }
        return  Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
    }
    distanceEuclidian(VectorB, is2d){
        const dx = this.x - VectorB.x
        const dy = this.y - VectorB.y
        const dz = this.z - VectorB.z
        if(is2d){
            return (dx * dx + dz * dz);
        }
        return  ((dx * dx) + (dy * dy) + (dz * dz));
    }
    set(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    multiplyScalar(scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }

    
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }

    /** @param {Vector3} vec3  */
    multiply(vec3) {
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;

        return this;
    }

    /** @param {Vector3} vec3  */
    divide(vec3) {
        this.x /= vec3.x;
        this.y /= vec3.y;
        this.z /= vec3.z;

        return this;
    }

    normalize() {
        return this.divideScalar(this.length() || 1 );
    }
    normalizeOne(){
        return new Vector3(clamp(this.x, -1, 1), clamp(this.y, -1, 1), clamp(this.z, -1, 1))
    }

    divideScalar(scale) {
        return this.multiplyScalar(1.0 / scale);
    }

    length() {
        return Math.sqrt((this.x * this.x) * (this.y * this.y) + (this.z * this.z));
    }


    /**
     * @param {Vector2} angles 
     * @param {number} range  
     */
    toAngle(range, angles){
        let rotator = new Vector2();
        rotator.toAngle(-range, angles.y);
        this.x = rotator.x;
        this.z = rotator.y;
        rotator.toAngle(-range, angles.x);
        this.y = rotator.y;
        return this;
    }

    /**@param {Vector3} euler  */
    rotateByEuler(euler){
        this._q.fromEuler(euler);

        const x = this.x, y = this.y, z = this.z;
        const qx = this._q.x, qy = this._q.y, qz = this._q.z, qw = this._q.w;

        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * qz * z;

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
        return this;
    }

    /**@param {Vector2} axisAngle  */
    applyDegress2D(axisAngle, pivot=ZERO_VEC3){
        this.x -= pivot.x;
        this.y -= pivot.y;
        this.z -= pivot.z;

        this.rotateByEuler(new Vector3(axisAngle.x * DEGRESS_TO_RADIANS,axisAngle.y * DEGRESS_TO_RADIANS,0));

        this.x += pivot.x;
        this.y += pivot.y;
        this.z += pivot.z;
        return this;
    }

    clone(){
        return new Vector3(this.x, this.y, this.z);
    }
}

const ZERO_VEC2 = new Vector2(0,0);
const ZERO_VEC3 = new Vector3(0,0);
//Functions
function createFovPositions(center, radius, angleDeg, segments, rotDeg, height) {
    let fovPoints = [];
    let angleIncrement = angleDeg / (segments - 1);
    let startAngle = rotDeg - angleDeg / 2;
    for (let h = 0; h <= height; h++) {
        for (let r = 1; r <= radius; r++) {
            for (let i = 0; i <= segments; i++) {
                let angle = startAngle + i * angleIncrement;
                let radAngle = angle * (Math.PI / 180);
                let x = center.x + r * Math.cos(radAngle);
                let y = center.z + r * Math.sin(radAngle);
                fovPoints.push({ x: x, y: center.y + h, z: y });
            }
        }
    }


    return fovPoints;

}
/**
 * 
 * @param {Vector3} position 
 * @param {Vector3} size 
 * @param {number} angleDeg 
 */
function createVolumeArea(size, angleDeg){
    const VectorDir = new Vector2(0, 1).rotate(angleDeg)
    return new Vector3(size.x * VectorDir.x, size.y, size.z * VectorDir.y)
}
function clamp(value, min, max){
    return Math.min(Math.max(value, min), max)
}
function lerp(start_value, end_value, t){
    const diff = (end_value - start_value)
    return start_value + (diff * t)
}

export { Vector2, Vector3, MathUtils, Quaternion, clamp, lerp, createFovPositions, createVolumeArea }
