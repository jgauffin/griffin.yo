using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web.Http;

namespace AspNet.WebApi.Controllers
{
    public class MessageController : ApiController
    {
        private static int _nextId = 2;

        private static readonly List<Message> _messages = new List<Message>()
        {
            new Message
            {
                Id = 1,
                Body = "1. Cook fish\r\n2. Eat it",
                Title = "Generate energy source",
                WrittenAtUtc = new DateTime(1999, 12, 31, 23, 59, 0)
            }
        };

        [Route("api/message/{id}"), HttpDelete]
        public void Delete(int id)
        {
            _messages.RemoveAll(x => x.Id == id);
        }

        [Route("api/message/{id}"), HttpGet]
        public Message Get(int id)
        {
            return _messages.FirstOrDefault(x => x.Id == id);
        }

        [Route("api/messages"), HttpGet]
        public IEnumerable<Message> List()
        {
            return _messages;
        }

        [Route("api/message"), HttpPost]
        public int Post(Message message)
        {
            var id = Interlocked.Increment(ref _nextId);
            message.Id = id;
            message.WrittenAtUtc = DateTime.UtcNow;
            _messages.Add(message);
            return id;
        }
    }

    public class Message
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime WrittenAtUtc { get; set; }
        public string Body { get; set; }
    }
}