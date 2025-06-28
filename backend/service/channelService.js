const Channel = require('../entity/postgres/Channel');

async function getAllChannels() {
  return await Channel.findAll();
}

async function getChannelById(id) {
  return await Channel.findByPk(id);
}

async function createChannel(data) {
  return await Channel.create(data);
}

async function updateChannel(id, data) {
  const channel = await Channel.findByPk(id);
  if (!channel) return null;
  return await channel.update(data);
}

async function deleteChannel(id) {
  const channel = await Channel.findByPk(id);
  if (!channel) return null;
  await channel.destroy();
  return true;
}

module.exports = {
  getAllChannels,
  getChannelById,
  createChannel,
  updateChannel,
  deleteChannel,
};
