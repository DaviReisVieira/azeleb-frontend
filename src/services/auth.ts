const delay = (amount = 750) =>
  new Promise((resolve) => setTimeout(resolve, amount));

export async function recoverUserInformation() {
  await delay();

  return {
    user: {
      name: "Davi Reis",
      username: "davi.souza@stone.com.br",
      avatar_url: "https://github.com/DaviReisVieira.png",
    },
  };
}
