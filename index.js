const Telegraf = require('telegraf');

//TOKEN
const bot = new Telegraf('1043853763:AAE3gnkOJ5ldfoPNzJFoGkMRDMXDoieA-dk');
const { Markup } = Telegraf;

//init answers
const answers_yes = ['думаю, перше','перше'];
const answers_no = ['друге','думаю, друге'];
var chose = 1;

//init questions
const fs = require('fs');
const test = JSON.parse(fs.readFileSync('test.json', 'utf8'));
var ie_questions = test.tests.IE.questions;

//TEST
var first = 0, second = 0;
var qNumber = 0;

function count_result(a, b) {
    if (a > b) {
        return 1;
    }

    if (b > a) {
        return 2;
    }

    else {
        return 0;
    }
}

function get_name_of_result(number, first, second, none) {
    if (number === 1){
        return first;
    }
    if (number === 2){
        return second;
    }
    if (number === 0){
        return none;
    }
}

async function editMenuTitle(ctx, key, value) {
    try {
        await ctx.editMessageText('1. ' + key + '\n' + '2. ' + value).catch(function (error) {
            console.error(error);
        });
    } catch (e) {
        console.error(e);
    }
}

function check_parity() {
    let parity = false;
    let n = chose;

    while(n !== 0)
    {
        parity = !parity;
        n = n & (n - 1);
    }

    return parity;
}

async function editMenuBody(ctx) {
    try {
        if (check_parity() === false) {
            await ctx.editMessageReplyMarkup(
                {
                    inline_keyboard: [[
                        {
                            text: answers_yes[0],
                            callback_data: 'chose_first'
                        },
                        {
                            text: answers_no[0],
                            callback_data: 'chose_second'
                        }
                    ]]
                }
            ).catch(function (error) {
                console.error(error);
            });
        } else {
            await ctx.editMessageReplyMarkup(
                {
                    inline_keyboard: [[
                        {
                            text: answers_yes[1],
                            callback_data: 'chose_first'
                        },
                        {
                            text: answers_no[1],
                            callback_data: 'chose_second'
                        }
                    ]]
                }
            ).catch(function (error) {
                console.error(error);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

async function endTest(ctx, first_name, second_name, none) {
    try {
        await ctx.editMessageText('Ви - ' + get_name_of_result(count_result(first,second), first_name, second_name, none)).catch( function(error){ console.error(error); } );
        first = 0;
        second = 0;
        qNumber = 0;
        chose = 1;
    } catch (e) {
        console.error(e);
    }
}

function todo_test(ctx, questions, first_name, second_name, none) {
    let qLength = Object.keys(questions).length - 1;
    let values = Object.values(questions);
    let keys = Object.keys(questions);

    //Creating keyboard
    let inlineMessageRatingKeyboard = Markup.inlineKeyboard([[
        Markup.callbackButton(answers_yes[chose], 'chose_first'),
        Markup.callbackButton(answers_no[chose], 'chose_second')
    ]]).extra();

    //Sending keyboard with question
    ctx.telegram.sendMessage(
        ctx.from.id,
        '1. ' + keys[0] + '\n' + '2. ' + values[0],
        inlineMessageRatingKeyboard);

    bot.action('chose_first', async (ctx) => {
        qNumber += 1;
        first += 1;
        chose +=1;

        if (qLength >= qNumber) {
            try {
                await editMenuTitle(ctx, keys[qNumber], values[qNumber]);
                await editMenuBody(ctx);

            } catch (e) {
                console.error(e);
            }

        } else {
            try {
                await endTest(ctx, first_name, second_name, none);
            } catch (e) {
                console.error(e);
            }
        }

        await ctx.answerCbQuery(qNumber.toString() + '/' + qLength.toString());
    });

    bot.action('chose_second', async (ctx) => {
        qNumber += 1;
        second += 1;
        chose +=1;

        if (qLength >= qNumber) {
            try {
                await editMenuTitle(ctx, keys[qNumber], values[qNumber]);
                await editMenuBody(ctx);

            } catch (e) {
                console.error(e);
            }

        } else {
            try {
                await endTest(ctx, first_name, second_name, none);
            } catch (e) {
                console.error(e);
            }
        }

        await ctx.answerCbQuery(qNumber.toString() + '/' + qLength.toString());
    });

    bot.startPolling();
}


//BASICS
bot.start((ctx) => ctx.reply('Welcome!'));

bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.on('sticker', (ctx) => ctx.reply('👍'));

//COMMUNICATION
bot.command('/test', async (ctx) => {
    try {
        todo_test(ctx, ie_questions, 'Екстраверт', 'Інтроверт', '50 на 50');
    } catch (e) {
        console.error(e);
    }
});

bot.launch().then(r => console.log("Bot is running.."));
