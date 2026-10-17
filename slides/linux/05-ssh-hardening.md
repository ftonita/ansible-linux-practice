<sub>СЛОЙ 3 · ЗАКРЫВАЕМ SSH · слайд 5 из 8</sub>

# Закрываем парадный вход: root и пароли — нет

**`Руками · /etc/ssh/sshd_config.d/`**

```bash
sudo tee /etc/ssh/sshd_config.d/10-hardening.conf <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
MaxAuthTries 3
AllowUsers anna
# Port 2222        # по желанию, см. оговорку
EOF
# проверить синтаксис и только потом применить
sudo sshd -t && sudo systemctl reload ssh
```

**`Ansible · ssh.yml`**

```yaml
- name: Жёсткие настройки SSH
  ansible.builtin.copy:
    dest: /etc/ssh/sshd_config.d/10-hardening.conf
    content: |
      PermitRootLogin no
      PasswordAuthentication no
      KbdInteractiveAuthentication no
      MaxAuthTries 3
      AllowUsers anna
    validate: /usr/sbin/sshd -t -f %s
  notify: Reload ssh
```

> [!NOTE]
> ⚠️ Не закрывайте текущую сессию, пока не проверите вход **в новом окне**. Иначе можно запереть себя снаружи.

| Кто стучится | Что его останавливает |
|---|---|
| 🤖 Бот перебирает пароль root | PermitRootLogin no, PasswordAuthentication no |
| 🤖 Бот перебирает пароль anna | PasswordAuthentication no |
| 🎣 Украли пароль anna | PasswordAuthentication no |
| 🗝️ Чужой ключ на аккаунте root | PermitRootLogin no, AllowUsers anna |
| 📡 Сканер стучится в порт 22 | ничего (смена порта лишь уменьшает шум) |
| 🙋 anna со своим ключом | проходит — себя мы не заперли |

| Сущность | Что это и зачем |
|---|---|
| Оговорка про смену порта | Это не замок, а табличка «здесь двери нет»: шума в логах меньше, но **защиты не прибавляет**. Не забудьте открыть новый порт в firewall. |

<details><summary>🎤 Заметки лектора</summary>

Настройки кладём отдельным файлом в sshd_config.d — так их не перетрёт обновление пакета. На Ubuntu в этой папке часто лежит 50-cloud-init.conf с PasswordAuthentication yes. Для sshd действует первое найденное значение, файлы читаются по алфавиту, поэтому наш 10-hardening.conf победит.

Пощёлкать переключатели: PermitRootLogin no отрезает главную цель ботов. PasswordAuthentication no делает перебор паролей бессмысленным. AllowUsers — белый список. А anna со своим ключом проходит всегда: мы себя не заперли.

Смена порта — честная оговорка: это снижает шум от ботов, но не является защитой. Сканер найдёт порт за секунды.

sshd -t проверяет синтаксис. В Ansible то же самое делает validate: битый конфиг просто не будет записан. И снова handler: reload произойдёт в конце play.

</details>

---

<div align="center">

[⬅️ Назад](04-user-keys.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/linux/#5) · [Далее ➡️](06-firewall.md)

</div>
