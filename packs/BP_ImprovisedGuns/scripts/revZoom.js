import * as server from "@minecraft/server"
const world = server.world
const offHandAnimation = 'animation.rev.crossbow.weapon_equipped.l'
const bothAnimation = 'animation.rev.crossbow.weapon_equipped.both'


server.system.runInterval(() =>
{
    const players = world.getAllPlayers();

    players.forEach((p) =>
    {
        const doAnimations = p.getDynamicProperty('rev:do_holding_animations')??true;
        const equippable = p.getComponent('equippable');
        const item = equippable.getEquipment('Mainhand');
        const offhand = equippable.getEquipment('Offhand');
        const holdAnim = item?.hasTag('rev:hold_animation') ?? false;
        const cooldown = item?.getComponent('cooldown') ?? false;
        const holdAnimF = item?.hasTag('rev:hold_animation_f') ?? false;
        const holdTag = p.hasTag('revHoldAnim') && !(item?.hasTag('rev:hold_c_animation') || item?.hasTag('rev:hold_c_animation_f'));
        let isOffValid = offhand ? (offhand.hasTag('rev:hold_animation_f') || offhand.hasTag('rev:hold_animation')) : false;
        let animation = holdAnim ? 'animation.rev.improv.weapon_equipped' : holdAnimF ? 'animation.rev.improv.weapon_equipped.f' : 'animation.rev.improv.weapon_equipped';
        animation = isOffValid ? 'animation.rev.improv.weapon_equipped.off' : animation;
        if (offhand && !isOffValid) animation = 'animation.rev.improv.weapon_equipped.f'

        if (isOffValid && (holdAnim || holdAnimF)) animation = 'animation.rev.improv.weapon_equipped.both'
        if (cooldown)
        {
            const remain = cooldown.getCooldownTicksRemaining(p);
            if (remain > 0 && remain < cooldown.cooldownTicks - 5) animation = 'animation.rev.improv.weapon_reloading';
        }
        if ((holdAnim || holdAnimF || isOffValid) && !p.isSwimming)
        {   if (doAnimations)
            p.playAnimation(animation,
            {
                nextState: 'a',
                blendOutTime: 9999
            });
            p.addTag('revHoldAnim');
        }
        else if (holdTag)
        {
            p.playAnimation(animation,
            {
                nextState: 'a',
                blendOutTime: 0
            });
            p.removeTag('revHoldAnim');
        }

        const itemId = item?.typeId;
        const isHunting = (itemId == "rev:hunting_musket" || itemId == "rev:shadow_hunting_musket")
        const isHuntingOff = (offhand?.typeId == "rev:hunting_musket" || offhand?.typeId == "rev:shadow_hunting_musket")
        if (p.isSneaking && (isHunting || isHuntingOff))
        {

            if (!p.hasTag('ddwsg2232'))
            {
                p.playSound('item.spyglass.use');
                p.addTag('ddwsg2232');
                
            } p.addEffect('slowness', 20,
            {
                amplifier: 7,
                showParticles: false
            });
        }
        else
        {
            if (isHunting || isHuntingOff)
            if(p.hasTag('ddwsg2232'))
            {
                p.playSound('item.spyglass.stop_using');
                p.removeTag('ddwsg2232');
                p.removeEffect('slowness');
            }
             
        }
    })
}, 5);