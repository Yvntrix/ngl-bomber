import { useState } from "react";
import logo from "./assets/nglbomber.png";
import loader from "./assets/three-dots.svg";
import { gameSlugs } from "./constants/gameSlug";
import { randomQuestions } from "./constants/randomMessages";

function App() {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [random, setRandom] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<number>(1);
  const [sentMessages, setSentMessages] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const deviceId = (): string => {
    let result = "";
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz-";
    for (let i = 0; i < 36; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  function messages(): string {
    const randomMessage =
      randomQuestions[Math.floor(Math.random() * randomQuestions.length)];
    setMessage(randomMessage);
    return randomMessage;
  }

  function gameSlug(): string {
    const randomGame = gameSlugs[Math.floor(Math.random() * gameSlugs.length)];

    return randomGame;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSentMessages(0);

    let count = 1;
    const postMessage = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            question: random ? messages() : message,
            deviceId: deviceId(),
            gameSlug: gameSlug(),
          }),
        });

        const data = await response.json();
        if (data.success) {
          count++;
          setSentMessages((prev) => prev + 1);
          if (repeat >= count) {
            setTimeout(() => {
              postMessage();
            }, 1200);
          } else {
            setLoading(false);
          }
        }

        if (data.error == 404) {
          setError(
            "Sorry, couldn't find that user! Double-check the username and let's try again to see what exciting journey awaits us!"
          );
          setLoading(false);
        }
        if (data.error == 429) {
          setError(
            "Server overwhelmed! Taking a breather to recover. We'll be back in a jiffy to resume the fun!"
          );
          setLoading(false);
        }
        if (data.error == 500) {
          postMessage();
        }
      } catch (error) {
        setError(
          "Uh-oh, something went wrong! Let's try again with some mischievous magic!"
        );
        setLoading(false);
        console.log(error);
      }
    };
    postMessage();
  };
  return (
    <main className="h-screen w-screen  flex flex-col items-center p-4 bg-gradient-to-br from-[#EC1187] to-[#FF8D10]">
      <header>
        <img src={logo} className="h-16" />
      </header>
      <section className="lg:w-[50%] md:w-[60%] bg-gray-50 md:p-8 py-8 px-4 w-full rounded-md mt-10">
        <h1 className="text-lg font-bold text-gray-900 text-center">
          Get ready to bombard your friends with messages of mischief and magic!
          Keep it fun, not harmful.
        </h1>
        <form className="w-full mt-5 flex flex-col" onSubmit={handleSubmit}>
          <div className="relative rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-orange-600 focus-within:ring-1 focus-within:ring-orange-600">
            <label
              htmlFor="name"
              className="absolute -top-2 left-2 -mt-px inline-block bg-gray-50 px-1 text-xs font-medium text-gray-900"
            >
              Their @username
            </label>
            <input
              disabled={loading}
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
                setSentMessages(0);
              }}
              type="text"
              name="name"
              id="name"
              className="block bg-gray-50 w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
              placeholder="bellapoarch"
            />
          </div>
          <div className="relative mt-5 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-orange-600 focus-within:ring-1 focus-within:ring-orange-600">
            <label
              htmlFor="message"
              className="absolute -top-2 left-2 -mt-px inline-block bg-gray-50  px-1 text-xs font-medium text-gray-900"
            >
              Your message
            </label>
            <div className="mt-1">
              <textarea
                disabled={loading}
                required
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError("");
                  setSentMessages(0);
                }}
                name="message"
                className="block w-full border-0 p-0 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
                placeholder="How is your day?"
              />
            </div>
          </div>
          <div className=" py-3 flex mt-3 justify-between items-center flex-col-reverse md:flex-row">
            <div className="relative flex items-start my-1 md:my-0 self-start md:self-auto">
              <div className="flex h-5 items-center">
                <input
                  disabled={loading}
                  checked={random}
                  onChange={(e) => {
                    setRandom(e.target.checked);
                    setError("");
                    setSentMessages(0);
                    if (!random) {
                      setMessage(messages());
                    }
                  }}
                  name="random"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="random" className="font-medium text-gray-700">
                  Send Random Message
                </label>
              </div>
            </div>
            <div className="relative mb-3 w-full md:mb-0 md:w-max rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-orange-600 focus-within:ring-1 focus-within:ring-orange-600">
              <label
                htmlFor="repeat"
                className="absolute -top-2 left-2 -mt-px inline-block bg-gray-50 px-1 text-xs font-medium text-gray-900"
              >
                Repeat {repeat} time(s)
              </label>
              <input
                disabled={loading}
                required
                value={repeat}
                max={50}
                onChange={(e) => {
                  setRepeat(Math.max(1, parseInt(e.target.value)));
                  setError("");
                  setSentMessages(0);
                }}
                type="number"
                name="repeat"
                className="block bg-gray-50 w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                placeholder="1"
              />
            </div>
          </div>
          <div className="w-full">
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-md border disabled:bg-slate-400 border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex justify-center items-center gap-4">
                  Sending messages <img src={loader} className="h-2" />
                </div>
              ) : (
                "Send!"
              )}
            </button>
          </div>
          {sentMessages > 0 && (
            <div className="bg-orange-200 p-3 rounded-md mt-2">
              <p className="text-center text-sm font-semibold text-orange-600">
                Sent {sentMessages} message(s) to {username}
              </p>
            </div>
          )}
          {error && (
            <div className="bg-red-200 p-3 rounded-md mt-2">
              <p className="text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            </div>
          )}
        </form>
        <h1 className="text-center pt-5">
          Created by&nbsp;
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/Yvntrix"
            className="font-semibold text-orange-600"
          >
            Yvntrix
          </a>
        </h1>
      </section>
    </main>
  );
}

export default App;
