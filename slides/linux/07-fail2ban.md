<sub>СЛОЙ 5 · FAIL2BAN · слайд 7 из 8</sub>

# fail2ban: охранник, который запоминает лица

**`Руками · терминал`**

```bash
sudo apt install -y fail2ban
sudo tee /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h
EOF
sudo systemctl restart fail2ban
# кто сейчас в бане?
sudo fail2ban-client status sshd
sudo fail2ban-client set sshd unbanip 198.51.100.7
```

**`Ansible · fail2ban.yml`**

```yaml
- name: fail2ban установлен
  ansible.builtin.apt: { name: fail2ban, state: present }

- name: Правила для SSH
  ansible.builtin.copy:
    dest: /etc/fail2ban/jail.local
    content: |
      [sshd]
      enabled  = true
      maxretry = 5
      findtime = 10m
      bantime  = 1h
  notify: Restart fail2ban
```

| Сущность | Что это и зачем |
|---|---|
| maxretry | сколько ошибок прощаем |
| findtime | за какое время считаем |
| bantime | на сколько не пускаем |
| fail2ban-client status sshd | журнал охранника |

| IP | Ошибки (из 5) | Статус |
|---|---|---|

> 💡 **Аналогия.** Охранник на входе запоминает лица: **5 неудачных попыток за 10 минут — и час вас не пускают**. Пару опечаток он прощает.

<details><summary>🎤 Заметки лектора</summary>

fail2ban читает логи и, если один IP слишком часто ошибается, добавляет правило firewall, которое временно его блокирует.

Аналогия: охранник запоминает лица. Пять неудачных попыток за 10 минут, и человека не пускают час. Свои ошибки (две опечатки) он прощает.

Нажать «Бот атакует» — после 5-й ошибки IP уходит в бан. «Я ошиблась 2 раза» — счётчик растёт, но бана нет. «Прошёл час» — баны снимаются.

Если вход по паролю уже отключён, зачем fail2ban? Он снижает шум и нагрузку и защищает другие сервисы: у fail2ban есть jail-ы для nginx, почты и т. д. Слои обороны дополняют друг друга. В Ansible снова видим handler — перезапуск только при изменении конфига.

</details>

---

<div align="center">

[⬅️ Назад](06-firewall.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/linux/#7) · [Далее ➡️](08-checklist.md)

</div>
