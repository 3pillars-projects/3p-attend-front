## Add the following into Github secrets

| Secret Key                           | Example Value                       |
| :----------------------------------- | :---------------------------------- |
| **MUJDN_FRONT_WEBSITE_NAME**         | `username-001-site1`                |
| **MUJDN_FRONT_SERVER_COMPUTER_NAME** | `https://win6158.site4now.net:8172` |
| **> ATTEND_BACK_SERVER_IP**          | `win6158.site4now.net`              |
| **> ATTEND_BACK_SERVER_USERNAME**    | `username-001`                      |
| **> ATTEND_BACK_SERVER_PASSWORD**    | `xxxxxxxxxxxx`                      |

```yml
- name: Deploy to Simply
        uses: talunzhang/auto-web-deploy@v1.0.1
        with:
          website-name: xxxxxx-00x-xxxx
          server-computer-name: https://winxxxx.site4now.net:8172
          server-username: xxxxxx
          server-password: xxxxxxxx
          source-path: '\xxxxx\xxxxx\xxxxx\release\'

- name: Sync files
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: winxxxx.site4now.net
          username: xxxxxx
          password: xxxxxxxxxxx

```
