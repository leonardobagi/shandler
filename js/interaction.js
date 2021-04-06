const { APIMessage } = require("discord.js")
const {createAPIMessage} = require('./api')
const FInteraction = require('./FInteraction')

const Callback = async (res, data) =>{
    if (!data || !res) return;
    if (!res.token) throw new Error('Token missing');
    data.token = res.token
    let guild = res.guild
    let member = res.member
    let channel = res.channel
    let extras = {
        member,
        channel,
        guild
    }
    let interaction = new FInteraction(res.client, data, extras)
    return interaction;
}

class Interaction {
    /**
     * Class for replaying to an interaction or other purposes
     * @param {Object} interaction - Raw interaction object from the api
     * @param {*} options - Extra data
     */
    constructor(interaction, options){
        
        let { channel, guild, client, member } = options
        this.type = interaction.type
        this.token = interaction.token
        this.member = member
        this.id = interaction.id
        this.client = client
        this.guild = guild
        this.data = interaction.data
        this.channel = channel

    }
    /**
     * Sends an Interaction response
     * @param {String} res - The message string or embed object
     * @param {Options} options - Options that should be passed to the api
     * @returns {Object}  FInteraction object
     * @example
     * interaction.reply("Bello")
     */
     async reply(res, options = {}){
        let data;
        if (!res && !options.embed && !options.embeds) throw new Error('Cannot send an empty message.')
        if (typeof res == 'string'){
            data = {
                content:res
            }
        }else{
            data = await createAPIMessage(this, res, this.client)
        }
        return this.client.api.interactions(this.id, this.token).callback
        .post({ data:{
            type: (options?.type ? options?.type : 4),
            data:data
        } })
        .then(async (m) => await Callback(this, m))
    }
    
}
module.exports = Interaction