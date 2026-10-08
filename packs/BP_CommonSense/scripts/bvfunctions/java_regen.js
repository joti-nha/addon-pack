import { world, system } from '@minecraft/server';
let count = 0x0;
const playerSet = new Set();
world.afterEvents.playerJoin.subscribe(({
    playerId: _0x4303e2
}) => playerSet.add(_0x4303e2));
world.afterEvents.playerLeave.subscribe(({
    playerId: _0x564e65
}) => playerSet["delete"](_0x564e65));
system.runInterval(() => {
    count++;
    for (const _0x4b6d1f of playerSet) {
        const _0x43e9ca = world.getEntity(_0x4b6d1f);
        if (!_0x43e9ca?.["isValid"]) {
            continue;
        }
        const _0x430079 = _0x43e9ca.getComponent("minecraft:health");
        const _0x48fc96 = _0x43e9ca.getComponent('minecraft:player.saturation');
        const _0x55849f = _0x43e9ca.getComponent("minecraft:player.hunger");
        if (_0x430079?.["currentValue"] === undefined || _0x48fc96?.["currentValue"] === undefined || _0x55849f?.["currentValue"] === undefined || _0x55849f?.["effectiveMax"] === undefined) {
            continue;
        }
        if (_0x430079.currentValue < _0x430079.effectiveMax && count % 0xa === 0x0 && _0x48fc96.currentValue >= 0x1 && _0x55849f.currentValue === _0x55849f.effectiveMax) {
            const _0x4674b8 = Math.min(_0x430079.effectiveMax, Math.max(0x0, _0x430079.currentValue + 0x1));
            const _0x3e27ac = Math.min(0x14, Math.max(0x0, _0x48fc96.currentValue - 0x1));
            _0x430079.setCurrentValue(_0x4674b8);
            _0x48fc96.setCurrentValue(_0x3e27ac);
        }
    }
});