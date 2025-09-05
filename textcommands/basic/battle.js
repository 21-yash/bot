const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder } = require('discord.js');
const Player = require('../../models/Player');
const Pet = require('../../models/Pet');
const { createErrorEmbed, createSuccessEmbed, createWarningEmbed, createCustomEmbed, createInfoEmbed } = require('../../utils/embed');
const allItems = require('../../gamedata/items');
const allPals = require('../../gamedata/pets');

module.exports = {
    name: 'battle',
    description: 'Challenge another player to a Pal battle!',
    usage: '<@user>',
    aliases: ['fight', 'duel', 'pvp'],
    async execute(message, args, client, prefix) {
        try {
            const challengerId = message.author.id;
            const challenger = await Player.findOne({ userId: challengerId });

            if (!challenger) {
                return message.reply({
                    embeds: [createErrorEmbed('No Adventure Started', `You haven't started your journey yet! Use \`${prefix}start\` to begin.`)]
                });
            }

            // Parse target user
            const targetUser = message.mentions.users.first();
            if (!targetUser) {
                return message.reply({
                    embeds: [createErrorEmbed('No Target', 'Please mention a user to challenge! Usage: `battle @user`')]
                });
            }

            if (targetUser.id === challengerId) {
                return message.reply({
                    embeds: [createErrorEmbed('Invalid Target', 'You cannot battle yourself!')]
                });
            }

            const opponent = await Player.findOne({ userId: targetUser.id });
            if (!opponent) {
                return message.reply({
                    embeds: [createErrorEmbed('Player Not Found', 'The mentioned user has not started their adventure yet!')]
                });
            }

            // Check if both players have Pals
            const challengerPals = await Pet.find({ ownerId: challengerId, status: 'Idle' });
            const opponentPals = await Pet.find({ ownerId: targetUser.id, status: 'Idle' });

            if (challengerPals.length === 0) {
                return message.reply({
                    embeds: [createErrorEmbed('No Available Pals', 'You have no idle Pals available for battle!')]
                });
            }

            if (opponentPals.length === 0) {
                return message.reply({
                    embeds: [createErrorEmbed('Opponent Has No Pals', 'Your opponent has no idle Pals available for battle!')]
                });
            }

            // Create battle invitation embed
            const inviteEmbed = createCustomEmbed(
                '⚔️ Battle Challenge!',
                `**${message.author.displayName}** has challenged **${targetUser.displayName}** to a Pal battle!\n\n` +
                `${targetUser.displayName}, do you accept this challenge?`,
                '#FF6B6B',
                {
                    footer: { text: 'Challenge expires in 60 seconds' },
                    timestamp: true
                }
            );

            const inviteButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_battle')
                    .setLabel('Accept Challenge')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('decline_battle')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const inviteMessage = await message.reply({
                content: `${targetUser}`,
                embeds: [inviteEmbed],
                components: [inviteButtons]
            });

            // Handle battle invitation response
            const inviteCollector = inviteMessage.createMessageComponentCollector({
                filter: i => i.user.id === targetUser.id,
                time: 60000,
                componentType: ComponentType.Button
            });

            inviteCollector.on('collect', async interaction => {
                if (interaction.customId === 'decline_battle') {
                    const declineEmbed = createWarningEmbed(
                        'Challenge Declined',
                        `${targetUser.displayName} has declined the battle challenge.`
                    );
                    await interaction.update({ embeds: [declineEmbed], components: [] });
                    return;
                }

                if (interaction.customId === 'accept_battle') {
                    const acceptEmbed = createSuccessEmbed(
                        'Challenge Accepted!',
                        `${targetUser.displayName} has accepted the challenge! Now both players will select their Pal and potion.`
                    );
                    await interaction.update({ embeds: [acceptEmbed], components: [] });

                    // Start battle preparation
                    await startBattlePreparation(message, challengerId, targetUser.id, client);
                }
            });

            inviteCollector.on('end', collected => {
                if (collected.size === 0) {
                    const timeoutEmbed = createWarningEmbed(
                        'Challenge Expired',
                        'The battle challenge has expired due to no response.'
                    );
                    inviteMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Battle command error:', error);
            message.reply({ embeds: [createErrorEmbed('An Error Occurred', 'There was a problem processing the battle command.')] });
        }
    }
};

async function startBattlePreparation(message, challengerId, opponentId, client) {
    const battleData = {
        challenger: { id: challengerId, pal: null, potion: null, ready: false },
        opponent: { id: opponentId, pal: null, potion: null, ready: false }
    };

    // Send preparation messages to both players
    await sendPreparationMessage(message, challengerId, battleData, client, true);
    await sendPreparationMessage(message, opponentId, battleData, client, false);
}

async function sendPreparationMessage(message, userId, battleData, client, isChallenger) {
    const player = await Player.findOne({ userId });
    const availablePals = await Pet.find({ ownerId: userId, status: 'Idle' });
    
    // Get available potions
    const potions = player.inventory.filter(item => {
        const itemData = allItems[item.itemId];
        return itemData && itemData.type === 'potion' && item.quantity > 0;
    });

    const palOptions = availablePals.slice(0, 25).map(pal => {
        const base = allPals[pal.basePetId];
        return {
            label: `${pal.nickname} (Lvl ${pal.level})`,
            description: `${base.type} • HP: ${pal.stats.hp} • ATK: ${pal.stats.atk} • DEF: ${pal.stats.def}`,
            value: pal.petId.toString()
        };
    });

    const potionOptions = [
        { label: 'No Potion', description: 'Fight without any potion boost', value: 'none' },
        ...potions.slice(0, 24).map((potion, index) => {
            const itemData = allItems[potion.itemId];
            return {
                label: itemData.name,
                description: itemData.description,
                value: `${potion.itemId}_${index}`
            };
        })
    ];

    const preparationEmbed = createCustomEmbed(
        '⚔️ Battle Preparation',
        `Select your Pal and potion for the upcoming battle!\n\n` +
        `**Available Pals:** ${availablePals.length}\n` +
        `**Available Potions:** ${potions.length}`,
        '#4ECDC4'
    );

    const palSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`select_battle_pal_${userId}`)
            .setPlaceholder('Choose your Pal for battle')
            .addOptions(palOptions)
    );

    const potionSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`select_battle_potion_${userId}`)
            .setPlaceholder('Choose a potion (optional)')
            .addOptions(potionOptions)
    );

    const readyButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`ready_for_battle_${userId}`)
            .setLabel('Ready for Battle!')
            .setStyle(ButtonStyle.Success)
            .setEmoji('⚔️')
            .setDisabled(true)
    );

    const preparationMessage = await message.channel.send({
        content: `<@${userId}>`,
        embeds: [preparationEmbed],
        components: [palSelect, potionSelect, readyButton]
    });

    // Handle preparation interactions
    const preparationCollector = preparationMessage.createMessageComponentCollector({
        filter: i => i.user.id === userId,
        time: 5 * 60 * 1000
    });

    preparationCollector.on('collect', async interaction => {
        if (interaction.customId === `select_battle_pal_${userId}`) {
            const selectedPalId = interaction.values[0];
            const selectedPal = availablePals.find(pal => pal.petId === selectedPalId);
            if (isChallenger) {
                battleData.challenger.pal = selectedPal;
            } else {
                battleData.opponent.pal = selectedPal;
            }
            
            await interaction.reply({
                content: `✅ Selected **${selectedPal.nickname}** for battle!`,
                ephemeral: true
            });

            await updateReadyButton(preparationMessage, userId, battleData);
        }
        
        if (interaction.customId === `select_battle_potion_${userId}`) {
            const selectedPotionId = interaction.values[0];
            const [itemId] = selectedPotionId.split('_');
            const selectedPotion = selectedPotionId === 'none' ? null : allItems[itemId];
            
            if (isChallenger) {
                battleData.challenger.potion = selectedPotion;
            } else {
                battleData.opponent.potion = selectedPotion;
            }

            const potionName = selectedPotion ? selectedPotion.name : 'No Potion';
            await interaction.reply({
                content: `✅ Selected **${potionName}** for battle!`,
                ephemeral: true
            });

            await updateReadyButton(preparationMessage, userId, battleData);
        }

        if (interaction.customId === `ready_for_battle_${userId}`) {
            if (isChallenger) {
                battleData.challenger.ready = true;
            } else {
                battleData.opponent.ready = true;
            }

            await interaction.update({
                components: interaction.message.components.map(row => {
                    const newRow = ActionRowBuilder.from(row);
                    newRow.components.forEach(component => {
                        if (component.data.custom_id === `ready_for_battle_${userId}`) {
                            component.setDisabled(true).setLabel('Ready!').setStyle(ButtonStyle.Secondary);
                        }
                    });
                    return newRow;
                })
            });

            // Check if both players are ready
            if (battleData.challenger.ready && battleData.opponent.ready) {
                await startBattle(message, battleData, client);
            }
        }
    });

    preparationCollector.on('end', () => {
        preparationMessage.edit({ components: [] }).catch(() => {});
    });
}

async function updateReadyButton(message, userId, battleData) {
    const playerData = battleData.challenger.id === userId ? battleData.challenger : battleData.opponent;
    const canReady = playerData.pal !== null;

    const components = message.components.map(row => {
        const newRow = ActionRowBuilder.from(row);
        newRow.components.forEach(component => {
            if (component.data.custom_id === `ready_for_battle_${userId}`) {
                component.setDisabled(!canReady);
            }
        });
        return newRow;
    });

    await message.edit({ components });
}

async function startBattle(message, battleData, client) {
    const { challenger, opponent } = battleData;
    
    // Apply potion effects
    const challengerPal = applyPotionEffects(challenger.pal, challenger.potion);
    const opponentPal = applyPotionEffects(opponent.pal, opponent.potion);

    // Determine turn order based on speed
    const challengerSpeed = challengerPal.stats.spd;
    const opponentSpeed = opponentPal.stats.spd;
    
    let firstPlayer, secondPlayer, firstPal, secondPal;
    if (challengerSpeed > opponentSpeed || (challengerSpeed === opponentSpeed && Math.random() < 0.5)) {
        firstPlayer = challenger;
        secondPlayer = opponent;
        firstPal = challengerPal;
        secondPal = opponentPal;
    } else {
        firstPlayer = opponent;
        secondPlayer = challenger;
        firstPal = opponentPal;
        secondPal = challengerPal;
    }

    // Start battle simulation
    const battleResult = await simulatePvPBattle(firstPlayer, secondPlayer, firstPal, secondPal, client);
    
    // Create battle result embed
    const resultEmbed = createCustomEmbed(
        '⚔️ Battle Results',
        battleResult.log,
        battleResult.winnerId === challenger.id ? '#4CAF50' : '#F44336',
        {
            fields: [
                {
                    name: '🏆 Winner',
                    value: `<@${battleResult.winnerId}> and **${battleResult.winnerPal.nickname}**!`,
                    inline: true
                },
                {
                    name: '📊 Final Stats',
                    value: `**${battleResult.winnerPal.nickname}:** ${battleResult.winnerRemainingHp}/${battleResult.winnerPal.stats.hp} HP\n` +
                          `**${battleResult.loserPal.nickname}:** 0/${battleResult.loserPal.stats.hp} HP`,
                    inline: true
                }
            ]
        }
    );

    await message.channel.send({ embeds: [resultEmbed] });
}

function applyPotionEffects(pal, potion) {
    if (!potion) return pal;

    const enhancedPal = JSON.parse(JSON.stringify(pal.toObject()));
    const effect = potion.effect;

    if (effect.type === 'heal') {
        enhancedPal.stats.hp += effect.value;
    } else if (effect.type === 'stat_boost') {
        if (enhancedPal.stats[effect.stat] !== undefined) {
            enhancedPal.stats[effect.stat] += effect.value;
        }
    } else if (effect.type === 'multi_boost') {
        Object.keys(effect.stats).forEach(stat => {
            if (enhancedPal.stats[stat] !== undefined) {
                enhancedPal.stats[stat] += effect.stats[stat];
            }
        });
    }

    return enhancedPal;
}

async function simulatePvPBattle(firstPlayer, secondPlayer, firstPal, secondPal, client) {
    let firstCurrentHp = firstPal.stats.hp;
    let secondCurrentHp = secondPal.stats.hp;
    const battleLog = [];
    let turn = 0;

    const firstUser = await client.users.fetch(firstPlayer.id);
    const secondUser = await client.users.fetch(secondPlayer.id);

    battleLog.push(`🎯 **${firstUser.displayName}'s ${firstPal.nickname}** goes first due to higher speed!`);
    battleLog.push('');

    const calculateDamage = (attacker, defender) => {
        const baseDamage = Math.max(1, Math.floor(attacker.atk - (defender.def / 2)));
        
        // Check for critical hit based on luck stat
        const critChance = Math.min(0.3, attacker.luck * 0.01); // Max 30% crit chance
        const isCrit = Math.random() < critChance;
        
        const finalDamage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;
        
        return { damage: finalDamage, isCrit };
    };

    while (firstCurrentHp > 0 && secondCurrentHp > 0 && turn < 50) {
        turn++;
        battleLog.push(`**--- Turn ${turn} ---**`);

        // First player attacks
        const firstAttack = calculateDamage(firstPal.stats, secondPal.stats);
        secondCurrentHp -= firstAttack.damage;
        
        if (firstAttack.isCrit) {
            battleLog.push(`💥 **CRITICAL HIT!** ${firstUser.displayName}'s **${firstPal.nickname}** deals **${firstAttack.damage}** damage!`);
        } else {
            battleLog.push(`⚔️ ${firstUser.displayName}'s **${firstPal.nickname}** attacks for **${firstAttack.damage}** damage!`);
        }

        if (secondCurrentHp <= 0) {
            battleLog.push(`💀 ${secondUser.displayName}'s **${secondPal.nickname}** has been defeated!`);
            break;
        }
        battleLog.push(`❤️ *${secondUser.displayName}'s ${secondPal.nickname}: ${secondCurrentHp}/${secondPal.stats.hp} HP*`);
        battleLog.push('');

        // Second player attacks
        const secondAttack = calculateDamage(secondPal.stats, firstPal.stats);
        firstCurrentHp -= secondAttack.damage;
        
        if (secondAttack.isCrit) {
            battleLog.push(`💥 **CRITICAL HIT!** ${secondUser.displayName}'s **${secondPal.nickname}** deals **${secondAttack.damage}** damage!`);
        } else {
            battleLog.push(`⚔️ ${secondUser.displayName}'s **${secondPal.nickname}** attacks for **${secondAttack.damage}** damage!`);
        }

        if (firstCurrentHp <= 0) {
            battleLog.push(`💀 ${firstUser.displayName}'s **${firstPal.nickname}** has been defeated!`);
            break;
        }
        battleLog.push(`❤️ *${firstUser.displayName}'s ${firstPal.nickname}: ${firstCurrentHp}/${firstPal.stats.hp} HP*`);
        battleLog.push('');
    }

    if (turn >= 50) {
        battleLog.push('⏱️ The battle lasted too long and ended in a draw!');
    }

    // Determine winner
    const winnerId = firstCurrentHp > 0 ? firstPlayer.id : secondPlayer.id;
    const winnerPal = firstCurrentHp > 0 ? firstPal : secondPal;
    const loserPal = firstCurrentHp > 0 ? secondPal : firstPal;
    const winnerRemainingHp = firstCurrentHp > 0 ? firstCurrentHp : secondCurrentHp;

    return {
        log: battleLog.join('\n'),
        winnerId,
        winnerPal,
        loserPal,
        winnerRemainingHp
    };
}
