// 사다리게임 Discord 봇
//
// 개발자 - 엉클
// 최근 업데이트 - 21.08.22
//

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
    client.application.commands.set([
        {
            name: '사다리게임',
            description: '사다리게임을 시작합니다.',
            options: [{
                name: '주제',
                type: 'STRING',
                description: '사다리게임의 주제를 정해주세요.',
            }]
            
        },
        {
            name: '정보',
            description: '봇 정보를 확인합니다.',
        }
        // 사다리게임 명령어 버전을 사용해보고 싶으실 경우 아래의 주석을 풀고 봇을 재실행하세요.
        // {
        //     name: '테스트',
        //     description: '사다리게임(명령어 버전)을 실행합니다.',
        //     options: [{
        //         name: '참여인원수',
        //         type: 'INTEGER',
        //         description: '참여인원 수를 알려주세요. 12명까지 함께 할 수 있습니다.',
        //         required: true,
        //     },
        //     {
        //         name: '당첨개수',
        //         type: 'INTEGER',
        //         description: '당첨될 개수를 알려주세요.',
        //         required: true,
        //     }]
        // },
    ])
    .catch(console.error);

	console.log('사다리게임 봇이 실행되었습니다.');
});

// 당첨값 무작위 배열 알고리즘
function shuffle(array) { 
    for (let index = array.length - 1; index > 0; index--) { 
        const randomPosition = Math.floor(Math.random() * (index + 1)); 
        const temporary = array[index]; 
        
        array[index] = array[randomPosition]; 
        array[randomPosition] = temporary; 
    } 
}

let joinCount = new Map()
let winCount = new Map()

let CommandOwner = ''

const MainEmbed = new MessageEmbed()
    .setColor('BLURPLE')
    .setTitle('🪜 사다리게임')

const defaultButtons = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('del')
            .setLabel('-')
            .setStyle('DANGER')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('add')
            .setLabel('+')
            .setStyle('SUCCESS')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('start')
            .setLabel('시작')
            .setStyle('PRIMARY')
    )

const windefaultButtons = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('win_del')
            .setLabel('-')
            .setStyle('DANGER')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('win_add')
            .setLabel('+')
            .setStyle('SUCCESS')
    )
    .addComponents(
        new MessageButton()
            .setCustomId('ladder_start')
            .setLabel('사다리 시작')
            .setStyle('PRIMARY')
    )

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    if (interaction.commandName === '정보') {
        const BotInfoEmbed = new MessageEmbed()
			.setColor('2F3136')
			.setTitle('봇 정보')
			.addFields(
				{ name: '개발자', value: '엉클' },
				{ name: '버전', value: '1.0' },
                { name: '소스 코드', value: '[GitHub](https://github.com/CelNuc/GhostLeg-Bot)'}
			)
			.setFooter(`정보 요청자: ${interaction.user.username} | ${interaction.user.id}`);

            return await interaction.reply({ embeds: [BotInfoEmbed] })
    }

	if (interaction.commandName === '사다리게임') {
        const UserId = interaction.user.id
        CommandOwner = UserId

        joinCount.set(UserId, 2)
        winCount.set(UserId, 1)

        const FirstButtons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('del')
                    .setLabel('-')
                    .setStyle('DANGER')
                    .setDisabled(true)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('add')
                    .setLabel('+')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('start')
                    .setLabel('시작')
                    .setStyle('PRIMARY')
            )
        
		await interaction.reply({ embeds: [MainEmbed.setDescription(`참여인원 수를 정해주세요.\n최대 12명까지 참여할 수 있습니다.\n\n**참여자 수**: 2`)], components: [FirstButtons] });

	}

    if (interaction.commandName === '테스트') {
        const joinNumber = interaction.options.getInteger('참여인원수')
        const winNumber = interaction.options.getInteger('당첨개수')

        // 예외처리들
        if (joinNumber < 2) {
            return interaction.reply({ content: '최소 2명 이상 참여해야합니다.' })
        }
        else if (joinNumber > 12) {
            return interaction.reply({ content: '최대 12명까지만 참여할 수 있습니다.' })
        }
        else if (winNumber < 1) {
            return interaction.reply({ content: '최소 1개 이상의 당첨개수가 있어야합니다.' })
        } 
        else if (joinNumber < winNumber) {
            return interaction.reply({ content: '당첨개수는 참여자수보다 이하여야 합니다.' })
        }

        const arr = new Array();

        for (let count = 0; count < joinNumber; ++count) {
            if (count < winNumber) {
                arr.push('당첨')
            }
            else {
                arr.push('꽝')
            }
        }

        shuffle(arr)

        let text = '';
        for (let count = 0; count < joinNumber; ++count) {
            text += `${count + 1}번 - ${arr.shift()}\n`
        }
        
        const Embed = new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle('🪜 사다리게임 결과')
            .setDescription(`${text}`)

        return await interaction.reply({ embeds: [Embed] })
    }
});

client.on('interactionCreate', async interaction => {
    const UserId = interaction.user.id

    if (!interaction.isButton()) return;
    
    const UserNumCount = joinCount.get(UserId)
    const UserWinCount = winCount.get(UserId)

    const SecondEmbed = new MessageEmbed()
        .setColor('BLURPLE')
        .setTitle('🪜 사다리게임')
        .setDescription(`당첨 개수를 정해주세요.\n최대 ${UserNumCount - 1}개까지만 설정할 수 있습니다.\n\n**참여자 수**: ${UserNumCount}\n**당첨 개수**: ${UserWinCount}`)
	
    if (interaction.customId === 'add') {
        if (UserId != CommandOwner) return;
        if (UserNumCount == 11) {
            joinCount.set(UserId, UserNumCount + 1)
            const delAddButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('del')
                        .setLabel('-')
                        .setStyle('DANGER')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setLabel('시작')
                        .setStyle('PRIMARY')
                )
            return await interaction.update({ embeds: [MainEmbed.setDescription(`참여인원 수를 정해주세요.\n최대 12명까지 참여할 수 있습니다.\n\n**참여자 수**: ${joinCount.get(UserId)}`)], components: [delAddButtons] });
        }
        if (UserNumCount >= 2) {
            joinCount.set(UserId, UserNumCount + 1)
            return await interaction.update({ embeds: [MainEmbed.setDescription(`참여인원 수를 정해주세요.\n최대 12명까지 참여할 수 있습니다.\n\n**참여자 수**: ${joinCount.get(UserId)}`)], components: [defaultButtons] });
        }
    }
    if (interaction.customId === 'del') {
        if (UserId != CommandOwner) return;
        if (UserNumCount == 3) {
            joinCount.set(UserId, UserNumCount - 1)
            const delAddButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('del')
                        .setLabel('-')
                        .setStyle('DANGER')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('start')
                        .setLabel('시작')
                        .setStyle('PRIMARY')
                )
            return await interaction.update({ embeds: [MainEmbed.setDescription(`참여인원 수를 정해주세요.\n최대 12명까지 참여할 수 있습니다.\n\n**참여자 수**: ${joinCount.get(UserId)}`)], components: [delAddButtons] });
        }
        if (UserNumCount <= 12) {
            joinCount.set(UserId, UserNumCount - 1)
            return await interaction.update({ embeds: [MainEmbed.setDescription(`참여인원 수를 정해주세요.\n최대 12명까지 참여할 수 있습니다.\n\n**참여자 수**: ${joinCount.get(UserId)}`)], components: [defaultButtons] });
        }
    }

    if (interaction.customId === 'start') {
        if (UserId != CommandOwner) return;
        if (UserNumCount == 2) {
            const nothingButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_del')
                        .setLabel('-')
                        .setStyle('DANGER')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('ladder_start')
                        .setLabel('사다리 시작')
                        .setStyle('PRIMARY')
                )
            return interaction.update({ embeds: [SecondEmbed], components: [nothingButtons] })
        }
        else {
            const winFristButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_del')
                        .setLabel('-')
                        .setStyle('DANGER')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('ladder_start')
                        .setLabel('사다리 시작')
                        .setStyle('PRIMARY')
                )
            interaction.update({ embeds: [SecondEmbed], components: [winFristButtons] })
        }
    }

    if (interaction.customId === 'win_add') {
        if (UserId != CommandOwner) return;
        if (UserWinCount == UserNumCount - 2) {
            winCount.set(UserId, UserWinCount + 1)
            const delAddButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_del')
                        .setLabel('-')
                        .setStyle('DANGER')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('ladder_start')
                        .setLabel('사다리 시작')
                        .setStyle('PRIMARY')
                )
            return await interaction.update({ embeds: [SecondEmbed.setDescription(`당첨 개수를 정해주세요.\n최대 ${UserNumCount - 1}개까지만 설정할 수 있습니다.\n\n**참여자 수**: ${UserNumCount}\n**당첨 개수**: ${winCount.get(UserId)}`)], components: [delAddButtons] })
        }
        if (UserWinCount >= 1) {
            winCount.set(UserId, UserWinCount + 1)
            return await interaction.update({ embeds: [SecondEmbed.setDescription(`당첨 개수를 정해주세요.\n최대 ${UserNumCount - 1}개까지만 설정할 수 있습니다.\n\n**참여자 수**: ${UserNumCount}\n**당첨 개수**: ${winCount.get(UserId)}`)], components: [windefaultButtons] })
        }
    }
    if (interaction.customId === 'win_del') {
        if (UserId != CommandOwner) return;
        if (UserWinCount == 2) {
            winCount.set(UserId, UserWinCount - 1)
            const deldelButtons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_del')
                        .setLabel('-')
                        .setStyle('DANGER')
                        .setDisabled(true)
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('win_add')
                        .setLabel('+')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('ladder_start')
                        .setLabel('사다리 시작')
                        .setStyle('PRIMARY')
                )
                return await interaction.update({ embeds: [SecondEmbed.setDescription(`당첨 개수를 정해주세요.\n최대 ${UserNumCount - 1}개까지만 설정할 수 있습니다.\n\n**참여자 수**: ${UserNumCount}\n**당첨 개수**: ${winCount.get(UserId)}`)], components: [deldelButtons] })
        }
        if (UserWinCount <= UserNumCount) {
            winCount.set(UserId, UserWinCount - 1)
            return await interaction.update({ embeds: [SecondEmbed.setDescription(`당첨 개수를 정해주세요.\n최대 ${UserNumCount - 1}개까지만 설정할 수 있습니다.\n\n**참여자 수**: ${UserNumCount}\n**당첨 개수**: ${winCount.get(UserId)}`)], components: [windefaultButtons] })
        }
    }
    if (interaction.customId === 'ladder_start') {
        if (UserId != CommandOwner) return;
        const arr = new Array();
    
        for (let count = 0; count < UserNumCount; ++count) {
            if (count < UserWinCount) {
                arr.push('당첨')
            }
            else {
                arr.push('꽝')
            }
        }

        shuffle(arr)

        let text = '';
        for (let count = 0; count < UserNumCount; ++count) {
            text += `${count + 1}번 - ${arr.shift()}\n`
        }
        
        const Embed = new MessageEmbed()
            .setColor('BLURPLE')
            .setTitle('🪜 사다리게임 결과')
            .setDescription(`${text}`)
        
        winCount.delete(UserId)
        joinCount.delete(UserId)
        return await interaction.update({ embeds: [Embed], components: [] })
    }
});


client.login(token);
