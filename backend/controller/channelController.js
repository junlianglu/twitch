const channelService = require('../service/channelService');

async function getAll(req, res) {
  const channels = await channelService.getAllChannels();
  res.json(channels);
}

async function getOne(req, res) {
  const channel = await channelService.getChannelById(req.params.id);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  res.json(channel);
}

async function create(req, res) {
  const channel = await channelService.createChannel(req.body);
  res.status(201).json(channel);
}

async function update(req, res) {
  const channel = await channelService.updateChannel(req.params.id, req.body);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  res.json(channel);
}

async function remove(req, res) {
  const success = await channelService.deleteChannel(req.params.id);
  if (!success) return res.status(404).json({ error: 'Channel not found' });
  res.status(204).send();
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
};
