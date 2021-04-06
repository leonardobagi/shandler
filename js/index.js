const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const {Collection} = require('discord.js')
const Interaction = require('./interaction')


class SHClient extends EventEmitter {
/**
 * Main class representing the wrapper/command-handler
 * @param {Object} client - Discord.js client object {@link https://discord.js.org/#/docs/main/stable/class/Client| Discord.js CLient}
 * @param {HandlerOptions} options - Options for this. {@link https://eximstudio.com/projects/shandler| Click here} for more info.
 */
    constructor (client, options = {}){
        super()

        let {
            commandsDir = '',
            showLogs = 'extra',
            autoDelete = true,
            cLogs = false,
            wrapper = false,
            autoRegister = true
        } = options;

        //errors
        if (!client) throw new Error('No discord.js client was provided\n Fix: Give discord.js client as the first argument.');
        if (!fs.existsSync(path.resolve(process.cwd(), commandsDir))) throw new Error(`Provided commands dir (${commandsDir}) does not exist`);
        
        this.client = client
        this.cLogs = cLogs
        
        this.client.on('ready', async () => {
            //command registration
            // @ts-ignore
            let app = this.client.api.applications(client.user.id)
            if (!wrapper){
                this.client.commands = new Collection()
                
                if (!commandsDir.length) throw new Error('please specify a commands folder')
                const cmdfls = fs.readdirSync(path.resolve(process.cwd(), commandsDir)).filter(m => m.endsWith('.js'))
                for (const f of cmdfls) {
                    const scmd = require(path.resolve(process.cwd(), commandsDir, f))
                    scmd.name = (scmd.name ? scmd.name : f.replace(/\.js$/i, ''))
                    scmd.description = (scmd.description ? scmd.description : "An awsome command")
                    if (client.commands.get(scmd.name)) throw new Error(`There are multiple commands with the name: ${scmd.name}`)
                    this.client.commands.set(scmd.name, scmd)
                    if (showLogs == 'extra') console.log(scmd.name+' was loaded')
                }
                if (showLogs == 'normal') console.log(this.client.commands.size+' Commands were loaded..!')
        
        
        
                //Global commands auto delete
                if (autoDelete){
                    // @ts-ignore
                    let gcmds = await this.client.api.applications(this.client.user.id).commands.get()
                        gcmds.filter((c) => !(this.client.commands.filter(m => !m.guilds).map(m => m.name.toLowerCase()).includes(c.name.toLowerCase()))).forEach((e) =>{
                            // @ts-ignore
                            this.client.api.applications(this.client.user.id).commands(e.id).then(m =>{
                                console.log("Command: "+e.name+" was deleted")
                                if (cLogs) console.log(m)
                                })
                        })
                    }
                    
                    //commands registration
                    if (autoRegister){
                        let data = []
                        
                        this.client.commands.each(async e => {
                            if (!e.guilds){
                                data.push({
                                    name: e.name,
                                    description: e.description,
                                    options: e.options
                                })
                            } else {
                                e.guilds.forEach(async (el) => {
                                    this.client.api.applications(this.client.user.id).guilds(el).commands.post({
                                        data:{
                                            name: e.name,
                                            description: e.description,
                                            options: e.options
                                        }
                                    }).then((m) =>{
                                        if (showLogs == 'extra') console.log('Command: '+e.name+' was registered for: '+el)
                                        if (cLogs) console.log(m)
                                    })
                                });
                            }
                        })
                        if (data){
                            app.commands.put({
                                data:data
                            }).then((c) => {
                                if (cLogs) console.log(c)
                                if (showLogs == 'normal') console.log(c.length + " Commands were registered")
                            }).catch(console.error)
                        }
                        if (showLogs == 'normal') console.log(this.client.commands.size+ ' commands were registered on discord API')
                        
                        if (showLogs == ('normal'||'extra')) console.log(this.client.user?.tag+' is ready.')
                    }
                }
        })


        // @ts-ignore
        this.client.ws.on('INTERACTION_CREATE', (interaction) => {
             (async (interaction, client) => {
                const member = await client.guilds.fetch(interaction.guild_id).then((g) => g.members.fetch(interaction.member.user.id))
                const guild = await client.guilds.fetch(interaction.guild_id)
                const channel = await client.channels.fetch(interaction.channel_id)
                const Options = {
                    guild,
                    channel,
                    member,
                    client
                }
                interaction = new Interaction(interaction, Options)
                const { options } = interaction.data
                try{
                    /**
                     * 
                     * @event SHClient#interaction
                     * @param {Options} interaction - Ineraction object
                     */
                    this.emit('interaction', interaction)
                    if (!wrapper) client.commands.get(interaction.data.name).run({interaction, member, client, guild, options, channel});
                } catch (e){
                    throw new Error(e)
                }
            })(interaction, this.client)
        })

    }
    /**
     * Deletes a command from specific guilds or globally
     * @param {Object} info - Info about the command
     * @param {Array<string>} guilds - The IDs of the guilds where this commnd is registered (null for global deletion)
     */
    async delete(info, guilds){
        if (!this.client.readyAt) throw new Error('Cannot use this method before client is ready.\nUse this method inside ready event');
        if (!info) throw new Error('Missing params: `info` is required')
        if (guilds) {
            guilds.forEach(async (g) => {
            // @ts-ignore
            let cmds = await this.client.api.applications(this.client.user.id).guilds(g).commands.get()
            let cmd = cmds.find((m) => (m.id == info.id || m.name.toLowerCase() === info.name.toLowerCase()))
            if (!cmd) return;
            // @ts-ignore
            this.client.api.applications(this.client.user.id).guilds(g).commands(cmd.id).delete().then(m =>{
                if (this.cLogs) console.log(m)
                console.log(cmd.name, ' was successfully deleted')
            })
        })
    } else {

            let gcmds = await this.client.api.applications(this.client.user.id).commands.get()
            let gcmd = gcmds.find((m) => m.id == info.id || m.name.toLowerCase() === info.name.toLowerCase())
            if (!gcmd) return;
            this.client.api.applications(this.client.user.id).commands(gcmd.id).delete().then(m =>{
                if (this.cLogs) console.log(m)
                console.log(gcmd.name, ' was successfully deleted')
            })
        }
    }
    /**
     * Register commands in Discord API
     * @param {Array<Object>} commands - Array of command objects 
     */
    async create(commands){
        if (!this.client.readyAt) throw new Error('Cannot use this method before client is ready.\nUse this method inside ready event');
        if (!commands) throw new Error("You need to pass the commands array")
        let data = []
            commands.forEach(async e => {
                if (!e.guilds){
                    data.push({
                        name: e.name,
                        description: e.description,
                        options: e.options 
                    })
                } else {
                    e.guilds.forEach(async (el) => {
                        this.client.api.applications(this.client.user.id).guilds(el).commands.post({
                            data:{
                                name: e.name,
                                description: e.description,
                                options: e.options
                            }
                        }).then((m) =>{
                            if (showLogs == 'extra') console.log('Command: '+e.name+' was registered for: '+el)
                            if (cLogs) console.log(m)
                        })
                    });
                }
        })
        if (data){
        this.client.api.applications(client.user.id).commands.put({
            data:data
        }).then((c) => {
            if (cLogs) console.log(c)
            if (showLogs == 'normal') console.log(c.length + " Commands were registered")
        }).catch(console.error)
    }
    }
}

module.exports = SHClient