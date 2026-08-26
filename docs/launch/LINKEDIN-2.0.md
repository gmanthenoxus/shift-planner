# LINKEDIN: Evenweek 2.0 launch

Written 2026-08-26. Owner: Moses. Copy seat: `noxus-copywriter`.
Status of the product at time of writing: 2.0 is live at https://gmanthenoxus.github.io/shift-planner/,
pushed, cold open confirmed by fetch on 2026-08-26.

<!-- This file is the content, the plan, and the fact sheet in one place, so a future session or a
     Canva/Notion pass does not have to re-derive any of it. Facts here are traceable to PROJECT.md,
     SCOPE.md, QA-REPORT.md and HANDOVER.md. Nothing in section 6 may be exceeded in any post. -->

---

## 0. The uncomfortable part, first

**You picked four asks. Four asks is no ask.** A LinkedIn post that says "try this, and also hire me,
and also come build with me, and also follow along" gets scrolled past. One post carries one
instruction. The other three are real and they are distributed across the follow-ups in section 5.

**Second, and bigger: LinkedIn will not get you users.** The reader `COPY-DECK.md` defines is a UK
shift worker on a phone after midnight, worried about money. That person is not on LinkedIn reading
build-in-public posts. LinkedIn gets you peers, recruiters, and people who might pay you to build
something. That is worth having, and it is the freelance-income goal, not the user goal.
`PROJECT.md` §0 says the constraint is that almost nobody knows the app exists, with one verified
external user. LinkedIn does not fix that. Section 7 says what would.

So: post this on LinkedIn for credibility and work leads. Treat any actual users it produces as a bonus.

---

## 1. The anchor post (primary)

Angle: the problem, personally. The maths you were doing yourself, and why it was wrong.
Ask: one. Try it, tell me what broke.

```
I work door security. Some weeks I'm on four shifts, some weeks two, and rent doesn't care which.

For months I did the same sum in my head on the bus home. Rent, phone, gas, the standing orders.
Divide by my hourly rate. Get a number. Work that many hours.

The number was always wrong, and tax is why. The hour that pushes you over a threshold isn't worth
what your first hour was worth, so "money I need, divided by my rate" always undershoots. I'd hit my
hours and still come up short.

So I built the thing that does it properly. It's called Evenweek.

Two questions: what you earn an hour, what your month costs. It gives you hours a week. About 30
seconds. If you want it sharper you can add a second job, split the bills into items, add a one-off
goal like a deposit or a flight. All optional, all reversible.

No account. No bank connection. Nothing leaves your browser, so I couldn't see your numbers if I
wanted to.

The first version I built asked nine questions before it told you anything. Nobody has patience for
nine questions at 1am. I rebuilt it around two.

It's free, it's live, and it's the second version of something I actually use myself.

If you're paid hourly, or you know someone who is: open it, spend a minute, then tell me what
confused you. I'd rather hear "this made no sense" than hear nothing.

Link in the first comment.
```

**First comment (post this yourself, immediately after):**

```
https://gmanthenoxus.github.io/shift-planner/

Free, no sign-up, works on a phone. Nine countries of tax modelling, or a flat rate if yours isn't
covered. The code is public and MIT licensed if you want to look under it.
```

Why the link goes in the comment: LinkedIn suppresses reach on posts with an external link in the
body. This is a real, current, measurable effect, not superstition. The trade is one extra tap.

---

## 2. Alternate anchor (use if the personal one feels too exposed)

Angle: the rebuild lesson. Same product, craft framing. Lower emotional reach, higher peer respect.

```
I shipped a tool last year that worked and that nobody used twice.

It asked nine questions before it answered one: country, job, rate, typical hours, pension, ceiling,
outgoings, categories, goals. Then it showed you a confident 0.0 hours a week with a green tick,
which reads as success and actually meant "I have nothing to work with."

The headline on the page asks how many hours your life costs. The app refused to answer until you'd
done homework.

So I rebuilt it. Two questions now: what you earn an hour, what your month costs. That produces the
number. Everything else, second job, split bills, one-off goals, is a refinement you add when you
have a reason to, and each one says what it buys you before you tap it.

The lesson I keep having to relearn: the thing that kills a small tool is almost never the feature
list. It's the distance between opening it and getting something back.

Evenweek, free, no account, nothing leaves your browser. Link in the first comment. If you're
paid hourly, try it and tell me where it loses you.
```

---

## 3. The get-involved ladder

Do not put all four rungs in one post. Pick one per post. This is the menu.

| Rung | The ask | Where it belongs |
|---|---|---|
| 1 | Open it, tell me what confused you | Anchor post. This is the only ask in post 1 |
| 2 | Send it to one person who's paid hourly | Post 2, or a reply to anyone who engages |
| 3 | Look at the code, open an issue, the repo is public and MIT | Post 3, aimed at devs |
| 4 | I build small tools like this. If you need one, message me | Post 4, stated once, plainly |

There is deliberately **no feedback form in the app**. 2.0 collects nothing, which is the whole trust
proposition, and adding a form triggers the privacy and ICO surface that scope explicitly deferred.
So the feedback route for this launch is LinkedIn comments and DMs. That is not a gap to patch before
posting, it is the design holding.

---

## 4. Posting mechanics

- **Anchor: Thursday 27 August 2026, 07:30 UK.** Tuesday to Thursday mornings are when this audience
  is on the platform. 07:30 fits your wake window without needing you to be up early on purpose.
- Reply to every comment within the first 90 minutes. Reach on LinkedIn is decided in roughly the
  first hour, and replying is the cheapest lever you have.
- No hashtag spam. Three at most, at the very bottom: #buildinpublic #shiftwork #indiedev
- No image on the anchor post. Text-only posts on personal accounts generally out-reach link cards
  and stock graphics. If you want visuals, save them for post 2 (a before/after of nine fields
  against two).
- Do not edit the post in the first hour. Editing resets distribution.

---

## 5. The four-week plan

One post a week, matching your one-progressive-update-a-week rule. You are moving mid-September, so
post 4 is the one that slips if anything does. Let it slip rather than posting it badly.

| # | Date | Angle | The one ask |
|---|---|---|---|
| 1 | Thu 27 Aug | Anchor: the maths I was doing on the bus | Try it, tell me what confused you |
| 2 | Wed 2 Sep | Nine questions to two: what the rebuild actually cost me | Send it to one person paid hourly |
| 3 | Wed 9 Sep | The rule I built the app around: it will never tell you which bill to pay first. Why a tool that touches money has a legal line, and where I drew mine | Repo is public, come look |
| 4 | Wed 16 Sep | What I can build for you, using this as the proof | Message me if you need a small tool built |

**Post 3 is the differentiated one.** Almost nobody posts about deliberately refusing to rank a user's
debts because of Art. 39E RAO and FCA PERG 17. It signals you understand the domain, not just the code.
That is the post most likely to reach someone who hires people.

**If the anchor flops** (under ~10 reactions, no comments): do not repost it. Change the channel, not
the copy. See section 7.

---

## 6. Fact sheet. Do not exceed this in any post.

**True and safe to claim:**

- Live and free at https://gmanthenoxus.github.io/shift-planner/
- 2.0 shipped 19 August 2026. Second full version, built after the first one was hard to use.
- Two inputs produce the answer: hourly pay, monthly cost.
- Tax modelling for nine countries: UK, Ireland, Germany, France, Netherlands, Spain, US, Canada,
  Australia. Or a flat custom rate.
- Multi-job blending, per-job pension rates, one-off goals, weekly shift log, coverage tracking,
  JSON export and import.
- No account, no server, no bank connection. Data stays in the browser.
- 134 behaviour tests and a 21-check cruelty and security pass, all green before ship.
- Source is public, MIT licensed.
- Moses uses it himself.

**Never claim:**

- Any user count, download count, or "hundreds of shift workers". `PROJECT.md` §0 records exactly
  **one** verified external user. Inventing a number here is the fastest way to lose the credibility
  the post exists to build.
- That the tax figures match HMRC or any tax authority. They are simplified effective-rate estimates
  and the app says so. Repeat that framing if tax comes up in comments.
- Anything about which bill to pay first, in the post or in any reply. The app's legal boundary binds
  you in the comments too.
- That it is an app you install. It is a web page. Call it a web app or just a link.

**Known inconsistency to fix before you post:** `README.md` says "8 countries" in the opening summary
and then lists nine in the features section. Someone will check. Fix the README line first, it is a
five-second edit.

---

## 7. What actually gets you users, since LinkedIn will not

Run this in parallel, not instead. It is the answer to `PROJECT.md` §0, and it is the thing your
weekly business update should be measuring.

1. **The people you already work with.** You supervise staff. They are paid hourly, they have variable
   shifts, and they are the exact reader in the copy deck. Ten of them trying it beats a thousand
   LinkedIn impressions. This costs nothing and is the highest-leverage action available to you.
2. **UK shift-work communities.** Facebook groups for SIA badge holders, care staff, hospitality.
   Reddit: r/UKPersonalFinance, r/SecurityGuards, r/UKJobs. Read the rules first, most ban self-promo,
   and post it as an answer to someone's question rather than as an announcement.
3. **WhatsApp.** Your one verified external user came from WhatsApp. That is data, not a coincidence.

---

## 8. What this plan is most likely wrong about

- **That the anchor gets meaningful reach at all.** Best case a few hundred impressions and one or two
  freelance conversations. Expected case: quiet, a handful of reactions from people who know you.
  Worst case: nothing, and the cost was 40 minutes. Reversible either way, which is why it is worth doing.
- **That the personal angle beats the craft angle.** It usually does on LinkedIn, but your network is
  probably weighted toward security work and university, not founders. If the anchor is quiet, post 2
  tests the other angle on the same audience, and that comparison is worth more than the reach.
- **That "tell me what broke" produces feedback.** Most people who try it and bounce will say nothing.
  Expect the useful feedback to come from the three or four people you ask directly, not from the post.
