function getRequests(payload) {
  const req = {
    'Відсутність на парах': [
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{sDate}}',
            matchCase: true,
          },
          replaceText: payload.sDate,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{eDate}}',
            matchCase: true,
          },
          replaceText: payload.eDate,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{reason}}',
            matchCase: true,
          },
          replaceText: payload.reason,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Пояснювальна записка': [
      {
        replaceAllText: {
          containsText: {
            text: '{{pib}}',
            matchCase: true,
          },
          replaceText: payload.pib,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{absenceDate}}',
            matchCase: true,
          },
          replaceText: payload.sDate,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{reason}}',
            matchCase: true,
          },
          replaceText: payload.reason,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Індивідуальний графік навчання': [
      {
        insertInlineImage: {
          uri: payload.uri,
          endOfSegmentLocation: {},
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{add}}',
            matchCase: true,
          },
          replaceText: payload.add,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{reason}}',
            matchCase: true,
          },
          replaceText: payload.reason,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Дистанційне навчання': [
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{reason}}',
            matchCase: true,
          },
          replaceText: payload.reason,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Переведення на іншу спеціальність': [
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withForm}}',
            matchCase: true,
          },
          replaceText: payload.withForm,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{toForm}}',
            matchCase: true,
          },
          replaceText: payload.toForm,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withSpecialty}}',
            matchCase: true,
          },
          replaceText: payload.withSpecialty,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{toSpecialty}}',
            matchCase: true,
          },
          replaceText: payload.toSpecialty,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Відрахування зa власним бажанням': [
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withForm}}',
            matchCase: true,
          },
          replaceText: payload.withForm,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withCourse}}',
            matchCase: true,
          },
          replaceText: payload.withCourse,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withSpecialty}}',
            matchCase: true,
          },
          replaceText: payload.withSpecialty,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{absenceDate}}',
            matchCase: true,
          },
          replaceText: payload.absenceDate,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
    'Поновлення до складу студентів': [
      {
        replaceAllText: {
          containsText: {
            text: '{{inGenitive}}',
            matchCase: true,
          },
          replaceText: payload.inGenitive,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{phone}}',
            matchCase: true,
          },
          replaceText: payload.phone,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{group}}',
            matchCase: true,
          },
          replaceText: payload.group,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withForm}}',
            matchCase: true,
          },
          replaceText: payload.withForm,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withCourse}}',
            matchCase: true,
          },
          replaceText: payload.withCourse,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{withSpecialty}}',
            matchCase: true,
          },
          replaceText: payload.withSpecialty,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{absenceDate}}',
            matchCase: true,
          },
          replaceText: payload.absenceDate,
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: '{{createDate}}',
            matchCase: true,
          },
          replaceText: payload.createDate,
        },
      },
    ],
  };
  return req[payload.docName];
}

module.exports = { getRequests };
