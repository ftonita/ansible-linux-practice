<sub>ПРИМЕР 2 ИЗ 5 · ДОСТУПЫ · слайд 8 из 16</sub>

# Пропускная система: пользователи и SSH-ключи

**`access.yml`**

```yaml
- name: Группа разработчиков
  ansible.builtin.group:
    name: devs

- name: Пользователь deploy
  ansible.builtin.user:
    name: deploy
    groups: devs
    shell: /bin/bash

- name: Его SSH-ключ
  ansible.posix.authorized_key:
    user: deploy
    key: "{{ lookup('file', 'keys/deploy.pub') }}"

- name: Запретить вход под root
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PermitRootLogin'
    line: PermitRootLogin no
  notify: Restart sshd
```

**🏢 Сервер = бизнес-центр**

| Сущность | Что это и зачем |
|---|---|
| 👥 Группа `devs` | отдел компании: общие права на всех |
| Пользователь `deploy` | Сотрудник отдела: своё рабочее место `/home/deploy` и своя оболочка. |
| authorized_key — личный электронный пропуск | Вход без пароля по SSH-ключу. Уволился — пропуск аннулировали одной правкой в коде. |
| Вход под root закрыт | Служебный вход с мастер-ключом заварен. Все заходят под своим именем, и видно, кто что делал. |

> 💡 **Аналогия.** Список сотрудников и пропусков лежит в отделе кадров (в Git), а не в голове охранника. Новый сервер получает **ту же систему пропусков** за один запуск.

<details><summary>🎤 Заметки лектора</summary>

Тема безопасности, которая понятна всем. Главная мысль: доступы описаны кодом. Пришёл новый человек — добавили его ключ в репозиторий и прогнали playbook на всех серверах сразу.

`notify: Restart sshd` — первое знакомство с handlers. Подробно разберём на следующем слайде.

Модуль authorized_key живёт в коллекции ansible.posix. Снова видим, что кирпичики лежат в разных «отделах магазина».

</details>

---

<div align="center">

[⬅️ Назад](07-example-os-firewall.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#8) · [Далее ➡️](09-example-nginx.md)

</div>
