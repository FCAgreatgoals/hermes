# Linking Exception to the AGPL-3.0

This software is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0),
with the following additional permission granted by the copyright holders:

## Exception

You may use this library in your own application (the "User Application") without the
User Application being subject to the terms of the AGPL-3.0, provided that:

1. **You do not modify the library itself.** Any modification to the library's source
   code — whether distributed as a binary, published as a package, or used to provide
   a service accessible over a network — must be made publicly available under the
   terms of the AGPL-3.0.

2. **"Modification" means** any change to the library's source files, including but
   not limited to bug fixes, feature additions, performance improvements, or derivative
   works based on the library's code.

3. **"Public use" means** any of the following: distributing the modified library as a
   binary or package to third parties, or using the modified library to provide a
   service accessible to users over a network (including but not limited to SaaS, APIs,
   and web applications).

4. **The User Application** — meaning the code that imports, links against, or otherwise
   depends on this library without modifying it — is explicitly exempt from the
   AGPL-3.0's copyleft requirements and may be licensed under any terms of your choosing.

5. **Only your modifications to @fca.gg/hermes must be open-sourced**, not your entire codebase.
   You are free to publish solely the modified parts of @fca.gg/hermes (e.g. as a standalone
   patch repository or a public fork) to satisfy this requirement. Your
   application code, business logic, and any unrelated code remain entirely private
   if you choose.

## In Plain English

| Situation | Obligation |
|---|---|
| You fork or patch @fca.gg/hermes and use it publicly | ✅ Publish your @fca.gg/hermes modifications (e.g. a patch repo) |
| You fork or patch @fca.gg/hermes and expose it over a network | ✅ Publish your @fca.gg/hermes modifications (e.g. a patch repo) |
| You use @fca.gg/hermes as a dependency (`npm install @fca.gg/hermes`) | ❌ No obligation, your code stays yours |
| You wrap @fca.gg/hermes without modifying it | ❌ No obligation, your code stays yours |
| You have private business logic alongside @fca.gg/hermes modifications | ✅ Only publish the @fca.gg/hermes modifications, keep the rest private |

## Full License

For the full AGPL-3.0 license text, see the [LICENSE](LICENSE) file or
https://www.gnu.org/licenses/agpl-3.0.html
