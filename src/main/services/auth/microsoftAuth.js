const { Auth } = require('msmc');

function toAccount(xbox, mclcProfile) {
  return {
    type: 'microsoft',
    uuid: mclcProfile.uuid,
    name: mclcProfile.name,
    mclcProfile,
    refreshToken: xbox.msToken?.refresh_token ?? null,
  };
}

async function login() {
  const auth = new Auth('select_account');
  const xbox = await auth.launch('electron');
  const mc = await xbox.getMinecraft();
  return toAccount(xbox, mc.mclc());
}

async function refresh(refreshToken) {
  const auth = new Auth('login');
  const xbox = await auth.refresh(refreshToken);
  const mc = await xbox.getMinecraft();
  return toAccount(xbox, mc.mclc());
}

module.exports = {
  login,
  refresh,
};
