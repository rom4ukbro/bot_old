const welcomeScene = require('./welcomeScene.js');
const progressScene = require('./progressScene');
const chooseScene = require('./chooseScene.js');
const { studentScene, teacherScene } = require('./selectScene');
const { scheduleScene, writeDateScene } = require('./scheduleScene');
const {
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
  mailingUpdateScene,
} = require('./adminScene');
const { defaultValueScene } = require('./defaultValueScene');
const { cbScene } = require('./cbScene.js');

module.exports = {
  welcomeScene,
  progressScene,
  chooseScene,
  logInAdminScene,
  adminPanelScene,
  mailingSimpleScene,
  mailingCbScene,
  mailingUpdateScene,
  defaultValueScene,
  cbScene,
  studentScene,
  teacherScene,
  scheduleScene,
  writeDateScene
}