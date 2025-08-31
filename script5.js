const API = "https://governodoapolistao.pythonanywhere.com";
let TOKEN = ""; // guarda o token do usuário

async function apiFetch(url, options = {}) {
  try {
    if (!options.headers) options.headers = {};

    // Só adiciona token se tiver e não for registrar/login
    if (TOKEN && !["/registrar", "/login"].includes(url)) {
      options.headers["Authorization"] = `Bearer ${TOKEN}`;
    }

    console.log("Fetching:", `${API}${url}`, options);

    let res = await fetch(`${API}${url}`, options);

    console.log("Recebeu status:", res.status);

    return res;
  } catch (e) {
    console.error("Falha no fetch:", e);
    throw e;
  }
}

async function registrar() {
  const username = document.getElementById("username").value;
  const senha = document.getElementById("senha").value;

  try {
    let r = await apiFetch("/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, senha })
    });

    let data = await r.json();

    if (!r.ok) {
      await login(username, senha);
      return;
    }

    TOKEN = data.token;
    msg(`Conta criada com código: ${data.codigo}`);
    entrarHome(username);

  } catch (e) {
    msg("Erro: " + e.message);
  }
}

async function login(username, senha) {
  try {
    let r = await apiFetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, senha })
    });

    let data = await r.json();

    if (r.ok) {
      TOKEN = data.token;
      entrarHome(username);
    } else {
      msg(data.erro || "Login falhou.");
    }
  } catch (e) {
    msg("Erro: " + e.message);
  }
}

function entrarHome(username) {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("home-section").classList.remove("hidden");
  document.getElementById("bemvindo").innerText = `Bem-vindo, ${username}`;
  verSaldo();
  verCodigo();
}

async function verSaldo() {
  try {
    let r = await apiFetch("/saldo");
    if (r.ok) {
      let data = await r.json();
      document.getElementById("saldo").innerText = data.saldo.toFixed(2) + " G$";
    }
  } catch (e) {
    msg("Erro ao buscar saldo: " + e.message);
  }
}

async function verCodigo() {
  try {
    let r = await apiFetch("/vercodigo");
    if (r.ok) {
      let data = await r.json();
      document.getElementById("codigo_usuario").innerText = data.codigo;
    }
  } catch (e) {
    msg("Erro ao buscar código: " + e.message);
  }
}

async function transferir() {
  const codigo = document.getElementById("codigo").value;
  const valor = document.getElementById("valor").value;

  try {
    let r = await apiFetch("/iniciartransferencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, valor })
    });

    let data = await r.json();
    msg(data.msg || data.erro);
    verSaldo();
  } catch (e) {
    msg("Erro na transferência: " + e.message);
  }
}

async function reembolsar() {
  const codigo = document.getElementById("codigo_reembolso").value;
  const valor = document.getElementById("valor_reembolso").value;

  try {
    let r = await apiFetch("/reembolso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, valor })
    });

    let data = await r.json();
    msg(data.msg || data.erro);
    verSaldo();
  } catch (e) {
    msg("Erro no reembolso: " + e.message);
  }
}

async function excluirConta() {
  try {
    let r = await apiFetch("/excluirconta", { method: "POST" });
    let data = await r.json();
    msg(data.msg || data.erro);
    document.getElementById("home-section").classList.add("hidden");
    document.getElementById("auth-section").classList.remove("hidden");
    TOKEN = "";
  } catch (e) {
    msg("Erro ao excluir conta: " + e.message);
  }
}

function msg(text) {
  document.getElementById("msg").innerText = text;
}
