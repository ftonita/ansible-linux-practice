<sub>ПОДХОД · слайд 3 из 16</sub>

# «Как сделать» или «что должно получиться»?

#### 🧭 **Навигатор: «через 200 м налево…»**
🧭

**`install.sh`**

```bash
# каждую проверку пишем сами
if ! dpkg -s nginx >/dev/null 2>&1; then
  apt-get update
  apt-get install -y nginx
fi
systemctl enable nginx
if ! systemctl is-active --quiet nginx; then
  systemctl start nginx
fi
```

- Каждую проверку «а не сделано ли уже?» пишете сами
- Другой дистрибутив — переписывать скрипт
- Повторный запуск безопасен, только если вы ничего не забыли

#### 🚕 **Такси: «на улицу Ленина, 5»**
🚕

**`nginx.yml`**

```yaml
# описываем результат
- name: nginx установлен
  ansible.builtin.apt:
    name: nginx
    state: present

- name: nginx запущен и в автозапуске
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
```

- Проверки уже встроены в модуль
- `package` вместо `apt` — и работает на любом Linux
- Повторный запуск безопасен всегда

<details><summary>🎤 Заметки лектора</summary>

Аналогия с такси: водителю называют адрес, а не «налево, направо, на светофоре прямо». Если пробка, водитель сам найдёт объезд.

Слева bash: половина кода — проверки «а не сделано ли уже». Без них повторный запуск ломается или делает лишнее. Справа то же самое, но проверки спрятаны внутри модулей.

Ключевое слово справа — **state**: present, started. Мы описываем, каким сервер должен быть, а не что с ним делать.

</details>

---

<div align="center">

[⬅️ Назад](02-why.md) · [▶️ Интерактивная версия](https://ftonita.github.io/ansible-linux-practice/#3) · [Далее ➡️](04-module.md)

</div>
