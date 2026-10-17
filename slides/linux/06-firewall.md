<sub>СЛОЙ 4 · FIREWALL И МИНИМУМ СЕРВИСОВ · слайд 6 из 8</sub>

# Сначала узнать, какие двери есть, потом поставить охрану

**`Руками · терминал`**

```bash
# какие сервисы слушают порты?
sudo ss -tulpn
# входящие — запрещены, исходящие — можно
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH       # сначала SSH!
sudo ufw allow 80,443/tcp
sudo ufw enable
# лишний сервис — выключить совсем
sudo systemctl disable --now cups
```

**`Ansible · firewall.yml`**

```yaml
- name: Разрешить SSH, HTTP, HTTPS
  community.general.ufw:
    rule: allow
    port: "{{ item }}"
    proto: tcp
  loop: ["22", "80", "443"]
- name: Включить ufw, остальное — deny
  community.general.ufw:
    state: enabled
    policy: deny
- name: Лишние сервисы выключены
  ansible.builtin.systemd:
    name: cups
    state: stopped
    enabled: false
```

| Сущность | Что это и зачем |
|---|---|
| $ sudo ss -tulpn | что видно из интернета |

| Сервис | Слушает | Без ufw | С ufw |
|---|---|---|---|
| sshd | 0.0.0.0:22 | виден всем | открыт намеренно |
| nginx | 0.0.0.0:80, :443 | виден всем | открыт намеренно |
| postgres | 127.0.0.1:5432 | только локально | только локально |
| redis | 0.0.0.0:6379 | виден всем | закрыт ufw, но слушает → лучше bind 127.0.0.1 |
| cupsd | 0.0.0.0:631 | виден всем | не нужен → systemctl disable --now |

| Сервис | Слушает | Снаружи |
|---|---|---|

- **ss -tulpn** — обход здания: какие двери вообще есть
- **ufw** — охрана на КПП: пускает только по списку
- **disable --now** — лишнюю дверь заложить кирпичом

<details><summary>🎤 Заметки лектора</summary>

Начинаем не с firewall, а с аудита: ss -tulpn показывает, какие программы слушают какие порты. Часто там находится то, о чём вы не знали: cups (печать), redis, открытый на весь мир, и так далее.

Пощёлкать: без ufw снаружи видно всё, что слушает 0.0.0.0. С ufw видно только 22, 80 и 443. Redis спрятан firewall-ом, но всё ещё слушает все интерфейсы. Лучше настроить его на 127.0.0.1: если firewall однажды выключат, база не окажется в интернете.

Порядок критичен: allow OpenSSH до ufw enable, иначе вы отрежете себе доступ. Если меняли порт SSH, разрешить нужно именно его.

Самый надёжный способ закрыть дверь — убрать её: ненужный сервис выключаем через systemctl disable --now.

</details>

---

<div align="center">

[⬅️ Назад](05-ssh-hardening.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/linux/#6) · [Далее ➡️](07-fail2ban.md)

</div>
