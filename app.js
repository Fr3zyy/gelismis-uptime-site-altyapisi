const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy } = require("passport-discord");
const mongoose = require("mongoose");
const Blog = require("./veri.js");
const bp = require("body-parser");
const fetch = require("node-fetch")
const { client } = require('./bot');
const { MessageEmbed } = require("discord.js");

//configs
const site = require('./configs/site.json');
const bot = require('./configs/bot.json');
const mongodbUrl = site.mongodbUrl;
///////

const app = express();
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"));

mongoose.connect(mongodbUrl, { useNewUrlParser: true })
	.then(() => console.log("[DATABASE] Veritabanına başarıyla bağlantı sağlandı!"))
	.catch(error => console.log("[DATABASE] Veritabanında hata oluştu!", error.message));


app.use(bp.urlencoded({ extended: false }))

app.use(bp.json())

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new Strategy(
	{
		clientID: bot.clientID,
		clientSecret: bot.clientSecret,
		callbackURL: bot.callbackURL, //callback url
		scope: ["identify", "guilds"],
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.session());
app.use(passport.initialize());

app.get(
	"/giris",
	passport.authenticate("discord", {
		scope: ["identify"],
	}),
);

app.get(
	"/callback",
	passport.authenticate("discord", {
		failureRedirect: "/hata",
	}),
	(_req, res) => res.redirect("/"),
);

app.get("/", (req, res) => {
	res.render("pages/index", { user: req.user, title: site.title, sayfa: "Anasayfa" })
});

app.get("/uptime", (req, res) => {
	res.render("pages/uptime", { user: req.user, title: site.title, sayfa: "Uptime Ekle" })
});



app.get("/logout", (req, res) => {
	req.session.destroy();
	return res.redirect("/");
});

app.get("/discord", (req, res) => {
	res.redirect(site.discordInvate)
})



app.get('/profile', async (req, res) => {
	try {
		const user = req.user;
		const blogs = await Blog.find({ id: user.id }).lean();
		res.render('pages/profile', { user: user, title: site.title, sayfa: user.username, blogs });
	} catch (err) {
		console.error(err);
		res.redirect('/');
	}
});

app.get('/sss', (req, res) => {
	const user = req.user;

	res.render('pages/sss', { user: user, title: site.title, sayfa: "SSS" });
});

app.get('/yetkililer', (req, res) => {
	const user = req.user;

	client.guilds.fetch(bot.guildId).then(guild => {
		const role = guild.roles.cache.get(bot.ownerRoleId);
		const membersWithRole = role.members.map(member => {
			return {
				id: member.id,
				username: member.user.username,
				avatar: member.user.avatarURL({ size: 512, dynamic: true })
			}
		});
		res.render('pages/yetkililer', {
			user: req.user,
			title: site.title,
			sayfa: "Yetkililerimiz",
			membersWithRole: membersWithRole
		});
	}).catch(err => {
		console.log(err);	
		return res.redirect('/');
	});
});



setInterval(() => {
	mongoose.connect(mongodbUrl, function (err, db) {
		var uptime = db.collection("uptimes");
		uptime.find({}).toArray(function (err, result) {
			result.forEach(site => {
				fetch(site.link)
			})
		})
	});
}, 60000)


app.post("/uptime", async (req, res) => {
	if (req.user) {
		try {
			const existingBlog = await Blog.findOne({ "link": req.body.link });
			if (existingBlog) {
				return res.render("pages/uptime", {
					user: req.user,
					errors: "Böyle Bir Link Zaten Var !",
					title: site.title,
					sayfa: "Yetkililerimiz"
				});
			}
			const blog = new Blog({
				"link": req.body.link,
				"id": req.user.id
			});
			await blog.save();

			const channel = client.channels.cache.get(bot.logChannelId);
			const embed = new MessageEmbed()
				.setColor("#0099ff")
				.setTitle("Yeni bir site eklendi!")
				.addFields(

					{ name: "Eklenen Link :", value: req.body.link },
					{ name: "Kullanici Id'si :", value: req.user.id },
					{ name: "Kullanıcı Adı :", value: req.user.username }
				)
				.setTimestamp();
			await channel.send(embed);

			return res.redirect("/uptime");
		} catch (err) {
			console.error(err);
			return res.render("pages/uptime", {
				errors: "An error occurred while saving the blog."
			});
		}
	}
});



app.listen(3000, () => {
	console.log("[START] Site başarıyla aktif edildi!");
});
require('./bot.js');
