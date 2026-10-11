import { UMLModel } from '../types/uml';

export const SAMPLE_MODELS: UMLModel[] = [
  {
    id: 'sample-ecommerce',
    systemName: 'سامانه فروشگاه آنلاین (E-Commerce System)',
    description: 'سیستم جامع فروشگاه آنلاین شامل مدیریت مشتریان، کاتالوگ محصولات، سبد خرید، سفارشات، درگاه پرداخت و ارسال مرسوله.',
    createdAt: new Date().toISOString(),
    flowchart: {
      title: 'فلوچارت فرآیند خرید آنلاین و پرداخت',
      description: 'جریان گام‌به‌گام از ورود کاربر، انتخاب کالا، بررسی موجودی انبار، درگاه پرداخت شاپرک تا صدور فاکتور نهایی.',
      nodes: [
        { id: 'fn_1', type: 'start', label: 'شروع: ورود به فروشگاه', description: 'کاربر وارد سایت یا اپلیکیشن شده و کالاها را مشاهده می‌کند.' },
        { id: 'fn_2', type: 'process', label: 'جستجو و انتخاب کالا', description: 'مشتری کالاهای موردنظر را انتخاب و به سبد خرید اضافه می‌نماید.' },
        { id: 'fn_3', type: 'decision', label: 'آیا موجودی کالا کافی است؟', description: 'سیستم موجودی انبار را برای اقلام سبد خرید بررسی می‌کند.' },
        { id: 'fn_4', type: 'process', label: 'ورود به حساب / ثبت آدرس', description: 'کاربر اطلاعات نشانی پستی و شماره تماس گیرنده را تایید می‌کند.' },
        { id: 'fn_5', type: 'process', label: 'اتصال به درگاه بانکی شاپرک', description: 'انتقال امن به صفحه درگاه پرداخت اینترنتی بانکی.' },
        { id: 'fn_6', type: 'decision', label: 'آیا پرداخت موفق بود؟', description: 'شاپرک نتیجه تراکنش و کد پیگیری را برمی‌گرداند.' },
        { id: 'fn_7', type: 'process', label: 'ثبت سفارش و صدور فاکتور', description: 'کسر قطعی از انبار، ارسال پیامک تایید و آماده‌سازی ارسال.' },
        { id: 'fn_8', type: 'process', label: 'نمایش خطای تراکنش بانکی', description: 'اعلام ناموفق بودن پرداخت به کاربر و امکان تلاش مجدد.' },
        { id: 'fn_9', type: 'end', label: 'پایان: تحویل کالا به پست', description: 'ارسال بسته به آدرس پستی مشتری و اتمام چرخه سفارش.' }
      ],
      edges: [
        { id: 'fe_1', source: 'fn_1', target: 'fn_2' },
        { id: 'fe_2', source: 'fn_2', target: 'fn_3' },
        { id: 'fe_3', source: 'fn_3', target: 'fn_4', label: 'بله (موجود است)' },
        { id: 'fe_4', source: 'fn_3', target: 'fn_2', label: 'خیر (ناموجود)' },
        { id: 'fe_5', source: 'fn_4', target: 'fn_5' },
        { id: 'fe_6', source: 'fn_5', target: 'fn_6' },
        { id: 'fe_7', source: 'fn_6', target: 'fn_7', label: 'بله (تایید شد)' },
        { id: 'fe_8', source: 'fn_6', target: 'fn_8', label: 'خیر (ناموفق)' },
        { id: 'fe_9', source: 'fn_8', target: 'fn_5', label: 'تلاش مجدد' },
        { id: 'fe_10', source: 'fn_7', target: 'fn_9' }
      ]
    },
    classes: [
      {
        id: 'c1',
        name: 'User',
        persianName: 'کاربر پایه سامانه',
        stereotype: 'abstract',
        description: 'کلاس پایه برای تمام کاربران سامانه شامل احراز هویت، ایمیل و رمزعبور هش‌شده.',
        attributes: [
          { name: 'id', type: 'Long', visibility: 'protected', description: 'شناسه یکتای عددی کاربر در پایگاه‌داده' },
          { name: 'username', type: 'String', visibility: 'protected', description: 'نام کاربری جهت ورود' },
          { name: 'email', type: 'String', visibility: 'protected', description: 'پست الکترونیکی معتبر' },
          { name: 'passwordHash', type: 'String', visibility: 'private', description: 'رمز عبور رمزنگاری‌شده (هش)' },
          { name: 'createdAt', type: 'Date', visibility: 'protected', description: 'تاریخ و ساعت ثبت‌نام در سامانه' }
        ],
        methods: [
          { name: 'login', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'password', type: 'String' }], description: 'بررسی رمز عبور و ایجاد نشست کاری' },
          { name: 'logout', returnType: 'void', visibility: 'public', parameters: [], description: 'خروج ایمن از حساب کاربری' },
          { name: 'updateProfile', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'newEmail', type: 'String' }], description: 'ویرایش اطلاعات کاربری' }
        ]
      },
      {
        id: 'c2',
        name: 'Customer',
        persianName: 'مشتری خریدار',
        stereotype: 'entity',
        description: 'مشتری فروشگاه با قابلیت سفارش‌گذاری، مدیریت سبد خرید و موجودی کیف پول.',
        attributes: [
          { name: 'shippingAddress', type: 'String', visibility: 'private', description: 'نشانی پستی دقیق ارسال مرسوله' },
          { name: 'phone', type: 'String', visibility: 'private', description: 'شماره تلفن همراه جهت هماهنگی پیک' },
          { name: 'walletBalance', type: 'double', visibility: 'private', defaultValue: '0.0', description: 'موجودی اعتبار ریالی کیف پول' }
        ],
        methods: [
          { name: 'addToCart', returnType: 'void', visibility: 'public', parameters: [{ name: 'product', type: 'Product' }, { name: 'quantity', type: 'int' }], description: 'افزودن کالای دلخواه به سبد خرید' },
          { name: 'checkout', returnType: 'Order', visibility: 'public', parameters: [], description: 'نهایی‌سازی سبد و ایجاد سفارش جدید' },
          { name: 'viewOrderHistory', returnType: 'List<Order>', visibility: 'public', parameters: [], description: 'مشاهده سوابق و وضعیت سفارش‌های پیشین' }
        ]
      },
      {
        id: 'c3',
        name: 'Admin',
        persianName: 'مدیر فروشگاه و انبار',
        stereotype: 'entity',
        description: 'مدیر سیستم با دسترسی کامل به گزارشات مالی، مدیریت محصولات و سفارشات.',
        attributes: [
          { name: 'roleLevel', type: 'int', visibility: 'private', description: 'سطح دسترسی مدیریتی (۱ تا ۵)' },
          { name: 'department', type: 'String', visibility: 'private', description: 'بخش مربوطه (فروش، انبار، پشتیبانی)' }
        ],
        methods: [
          { name: 'addProduct', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'product', type: 'Product' }], description: 'افزودن محصول جدید به انبار' },
          { name: 'removeProduct', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'productId', type: 'Long' }], description: 'حذف یا غیرفعال‌سازی کالا' },
          { name: 'generateSalesReport', returnType: 'Report', visibility: 'public', parameters: [{ name: 'month', type: 'int' }], description: 'تولید گزارش درآمدی ماهانه' }
        ]
      },
      {
        id: 'c4',
        name: 'Product',
        persianName: 'کالا و محصول',
        stereotype: 'entity',
        description: 'کالاهای موجود در کاتالوگ فروشگاه با قیمت، تعداد انبار و کد اختصاصی.',
        attributes: [
          { name: 'id', type: 'Long', visibility: 'private', description: 'شناسه اختصاصی بارکد کالا' },
          { name: 'title', type: 'String', visibility: 'private', description: 'عنوان تجاری محصول' },
          { name: 'price', type: 'double', visibility: 'private', description: 'قیمت فروش بر حسب ریال' },
          { name: 'stockCount', type: 'int', visibility: 'private', description: 'تعداد موجودی در انبار فیزیکی' },
          { name: 'category', type: 'Category', visibility: 'private', description: 'دسته‌بندی موضوعی کالا' }
        ],
        methods: [
          { name: 'isAvailable', returnType: 'boolean', visibility: 'public', parameters: [], description: 'آیا حداقل ۱ عدد در انبار موجود است؟' },
          { name: 'reduceStock', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'qty', type: 'int' }], description: 'کسر از موجودی انبار پس از فروش' },
          { name: 'applyDiscount', returnType: 'void', visibility: 'public', parameters: [{ name: 'percent', type: 'double' }], description: 'اعمال تخفیف شگفت‌انگیز' }
        ]
      },
      {
        id: 'c5',
        name: 'ShoppingCart',
        persianName: 'سبد خرید آنلاین',
        stereotype: 'entity',
        description: 'سبد خرید موقت که اقلام انتخابی کاربر را تا زمان پرداخت نگهداری می‌کند.',
        attributes: [
          { name: 'cartId', type: 'String', visibility: 'private', description: 'کد نشست سبد خرید کاربر' },
          { name: 'totalAmount', type: 'double', visibility: 'private', description: 'جمع کل هزینه اقلام سبد' },
          { name: 'lastUpdated', type: 'Date', visibility: 'private', description: 'آخرین زمان ویرایش سبد' }
        ],
        methods: [
          { name: 'calculateTotal', returnType: 'double', visibility: 'public', parameters: [], description: 'محاسبه مجموع قیمت به همراه مالیات' },
          { name: 'clearCart', returnType: 'void', visibility: 'public', parameters: [], description: 'خالی کردن سبد خرید پس از سفارش' },
          { name: 'removeItem', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'productId', type: 'Long' }], description: 'حذف یک قلم کالا از سبد' }
        ]
      },
      {
        id: 'c6',
        name: 'Order',
        persianName: 'سفارش ثبت‌شده',
        stereotype: 'entity',
        description: 'سفارش قطعی ثبت‌شده توسط مشتری به همراه کد رهگیری پستی و وضعیت پرداخت.',
        attributes: [
          { name: 'orderNumber', type: 'String', visibility: 'private', description: 'شماره پیگیری فاکتور (سفارش)' },
          { name: 'status', type: 'String', visibility: 'private', description: 'وضعیت سفارش: در حال پردازش، ارسال‌شده، تحویل‌شده' },
          { name: 'totalPrice', type: 'double', visibility: 'private', description: 'مبلغ نهایی پرداخت‌شده' },
          { name: 'orderDate', type: 'Date', visibility: 'private', description: 'تاریخ و زمان دقیق ثبت فاکتور' }
        ],
        methods: [
          { name: 'cancelOrder', returnType: 'boolean', visibility: 'public', parameters: [], description: 'لغو سفارش قبل از تحویل به پست' },
          { name: 'trackShipping', returnType: 'String', visibility: 'public', parameters: [], description: 'استعلام آخرین وضعیت از سامانه پست' },
          { name: 'confirmReceipt', returnType: 'void', visibility: 'public', parameters: [], description: 'تایید دریافت کالا توسط مشتری' }
        ]
      },
      {
        id: 'c7',
        name: 'Payment',
        persianName: 'پرداخت و تراکنش مالی',
        stereotype: 'control',
        description: 'کنترل‌کننده منطق تراکنش بانکی و تسویه حساب با درگاه‌های شتاب.',
        attributes: [
          { name: 'transactionId', type: 'String', visibility: 'private', description: 'کد ارجاع شاپرک (RRN)' },
          { name: 'amount', type: 'double', visibility: 'private', description: 'مبلغ تراکنش به ریال' },
          { name: 'paymentDate', type: 'Date', visibility: 'private', description: 'زمان انجام تراکنش' },
          { name: 'gatewayName', type: 'String', visibility: 'private', description: 'نام درگاه (سامان، ملت، پاسارگاد)' }
        ],
        methods: [
          { name: 'processPayment', returnType: 'boolean', visibility: 'public', parameters: [], description: 'ارسال درخواست پرداخت به شبکه شتاب' },
          { name: 'verifyToken', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'token', type: 'String' }], description: 'اعتبارسنجی توکن برگشتی از بانک' },
          { name: 'refund', returnType: 'boolean', visibility: 'public', parameters: [], description: 'استرداد وجه در صورت انصراف' }
        ]
      }
    ],
    relationships: [
      { id: 'r1', source: 'Customer', target: 'User', type: 'inheritance', label: 'ارث‌بری از کاربر' },
      { id: 'r2', source: 'Admin', target: 'User', type: 'inheritance', label: 'ارث‌بری از کاربر' },
      { id: 'r3', source: 'Customer', target: 'ShoppingCart', type: 'composition', sourceMultiplicity: '1', targetMultiplicity: '1', label: 'دارد' },
      { id: 'r4', source: 'Customer', target: 'Order', type: 'association', sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'ثبت سفارش' },
      { id: 'r5', source: 'Order', target: 'Product', type: 'aggregation', sourceMultiplicity: '1..*', targetMultiplicity: '1..*', label: 'شامل اقلام کالا' },
      { id: 'r6', source: 'Order', target: 'Payment', type: 'composition', sourceMultiplicity: '1', targetMultiplicity: '1', label: 'پرداخت مربوطه' }
    ],
    actors: [
      { id: 'a1', name: 'Customer', description: 'مشتری خریدار کالا' },
      { id: 'a2', name: 'Admin', description: 'مدیر سیستم و انبارداری' },
      { id: 'a3', name: 'BankGateway', description: 'درگاه پرداخت شاپرک' }
    ],
    useCases: [
      { id: 'uc1', name: 'جستجو و مشاهده کالا', actors: ['Customer'], description: 'جستجو بر اساس نام، دسته‌بندی و فیلتر قیمت' },
      { id: 'uc2', name: 'افزودن به سبد خرید', actors: ['Customer'], description: 'انتخاب تعداد و افزودن کالا به سبد' },
      { id: 'uc3', name: 'نهایی‌سازی سفارش و پرداخت', actors: ['Customer', 'BankGateway'], description: 'اتصال به درگاه و صدور فاکتور', includes: ['اعتبارسنجی موجودی کالا'] },
      { id: 'uc4', name: 'پیگیری مرسوله پستی', actors: ['Customer'], description: 'مشاهده کد رهگیری و آخرین وضعیت ارسال' },
      { id: 'uc5', name: 'مدیریت موجودی و قیمت‌گذاری', actors: ['Admin'], description: 'افزودن و ویرایش اطلاعات محصولات' },
      { id: 'uc6', name: 'تایید تراکنش بانکی', actors: ['BankGateway'], description: 'تایید اصالت تراکنش از سمت شاپرک' }
    ]
  },
  {
    id: 'sample-university',
    systemName: 'سامانه گلستان / مدیریت دانشگاه (University Portal)',
    description: 'سیستم جامع انتخاب واحد، نمرات، مدیریت اساتید و دانشجویان و امور مالی دانشگاه.',
    createdAt: new Date().toISOString(),
    flowchart: {
      title: 'فلوچارت فرآیند انتخاب واحد دانشجو',
      description: 'مراحل احراز هویت دانشجو، اعتبارسنجی پیش‌نیازها و تداخل ساعات کلاسی تا ثبت نهایی در سامانه آموزش دانشگاه.',
      nodes: [
        { id: 'fnu_1', type: 'start', label: 'شروع: ورود به پرتال دانشگاه', description: 'دانشجو با شماره دانشجویی و رمز عبور وارد پورتال می‌شود.' },
        { id: 'fnu_2', type: 'decision', label: 'آیا مجاز به انتخاب واحد است؟', description: 'بررسی وضعیت مالی (تسویه شهریه) و عدم مشروطی اخراجی.' },
        { id: 'fnu_3', type: 'process', label: 'مشاهده چارت و لیست دروس ارائه‌شده', description: 'مشاهده لیست دروس ارائه‌شده با ظرفیت و نام استاد.' },
        { id: 'fnu_4', type: 'decision', label: 'بررسی پیش‌نیاز و هم‌نیاز دروس', description: 'سیستم چک می‌کند که آیا دروس پیش‌نیاز قبلاً گذرانده شده‌اند یا خیر.' },
        { id: 'fnu_5', type: 'decision', label: 'آیا تداخل کلاسی یا امتحانی وجود دارد؟', description: 'بررسی عدم همپوشانی روز و ساعت کلاس‌ها و امتحانات پایان‌ترم.' },
        { id: 'fnu_6', type: 'process', label: 'ثبت دروس و ارسال به آموزش دانشکده', description: 'دروس انتخابی در کارتابل آموزش دانشکده قرار می‌گیرد.' },
        { id: 'fnu_7', type: 'decision', label: 'تایید نهایی توسط استاد راهنما', description: 'استاد راهنما دروس را تایید یا رد می‌کند.' },
        { id: 'fnu_8', type: 'end', label: 'پایان: صدور برگه انتخاب واحد', description: 'چاپ برگه تثبیت انتخاب واحد با زمان‌بندی هفتگی.' }
      ],
      edges: [
        { id: 'feu_1', source: 'fnu_1', target: 'fnu_2' },
        { id: 'feu_2', source: 'fnu_2', target: 'fnu_3', label: 'بله (مجاز)' },
        { id: 'feu_3', source: 'fnu_3', target: 'fnu_4' },
        { id: 'feu_4', source: 'fnu_4', target: 'fnu_5', label: 'تایید پیش‌نیاز' },
        { id: 'feu_5', source: 'fnu_5', target: 'fnu_6', label: 'بدون تداخل' },
        { id: 'feu_6', source: 'fnu_6', target: 'fnu_7' },
        { id: 'feu_7', source: 'fnu_7', target: 'fnu_8', label: 'تایید شد' }
      ]
    },
    classes: [
      {
        id: 'cu1',
        name: 'Person',
        persianName: 'شخص (کلاس پایه دانشگاه)',
        stereotype: 'abstract',
        description: 'کلاس پایه برای تمام افراد حاضر در محیط دانشگاه اعم از دانشجو و استاد.',
        attributes: [
          { name: 'nationalCode', type: 'String', visibility: 'protected', description: 'کد ملی ۱۰ رقمی' },
          { name: 'firstName', type: 'String', visibility: 'protected', description: 'نام' },
          { name: 'lastName', type: 'String', visibility: 'protected', description: 'نام خانوادگی' },
          { name: 'email', type: 'String', visibility: 'protected', description: 'ایمیل دانشگاهی' }
        ],
        methods: [
          { name: 'getFullName', returnType: 'String', visibility: 'public', parameters: [], description: 'دریافت نام و نام خانوادگی کامل' }
        ]
      },
      {
        id: 'cu2',
        name: 'Student',
        persianName: 'دانشجو',
        stereotype: 'entity',
        description: 'موجودیت دانشجو شامل شماره دانشجویی، سال ورود و معدل کل.',
        attributes: [
          { name: 'studentId', type: 'String', visibility: 'private', description: 'شماره دانشجویی یکتا' },
          { name: 'entryYear', type: 'int', visibility: 'private', description: 'سال ورود به دانشگاه' },
          { name: 'gpa', type: 'double', visibility: 'private', description: 'معدل کل نمرات' }
        ],
        methods: [
          { name: 'registerCourse', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'courseCode', type: 'String' }], description: 'انتخاب یک درس خاص' },
          { name: 'viewGrades', returnType: 'List<Grade>', visibility: 'public', parameters: [], description: 'مشاهده کارنامه تحصیلی' },
          { name: 'calculateGPA', returnType: 'double', visibility: 'public', parameters: [], description: 'محاسبه معدل بر اساس ضریب واحدها' }
        ]
      },
      {
        id: 'cu3',
        name: 'Professor',
        persianName: 'استاد / عضو هیئت علمی',
        stereotype: 'entity',
        description: 'استاد دانشگاه با کد پرسنلی، مرتبه علمی و دانشکده تخصصی.',
        attributes: [
          { name: 'employeeId', type: 'String', visibility: 'private', description: 'کد پرسنلی استخدامی' },
          { name: 'academicRank', type: 'String', visibility: 'private', description: 'مرتبه علمی (استادیار، دانشیار، استاد تمام)' },
          { name: 'department', type: 'String', visibility: 'private', description: 'دانشکده یا گروه آموزشی' }
        ],
        methods: [
          { name: 'submitGrades', returnType: 'boolean', visibility: 'public', parameters: [{ name: 'courseId', type: 'Long' }, { name: 'grades', type: 'Map' }], description: 'ثبت و قفل نمرات دانشجویان' },
          { name: 'viewEnrolledStudents', returnType: 'List<Student>', visibility: 'public', parameters: [{ name: 'courseId', type: 'Long' }], description: 'مشاهده لیست دانشجویان حاضر در کلاس' }
        ]
      },
      {
        id: 'cu4',
        name: 'Course',
        persianName: 'درس تحصیلی',
        stereotype: 'entity',
        description: 'درس ارائه شده در چارت درسی به همراه تعداد واحد و پیش‌نیازها.',
        attributes: [
          { name: 'courseCode', type: 'String', visibility: 'private', description: 'کد درس در سیستم گلستان' },
          { name: 'title', type: 'String', visibility: 'private', description: 'نام کامل درس (مثلاً مهندسی نرم‌افزار)' },
          { name: 'units', type: 'int', visibility: 'private', description: 'تعداد واحدهای درس (تئوری یا عملی)' },
          { name: 'capacity', type: 'int', visibility: 'private', description: 'ظرفیت پذیرش دانشجو در کلاس' }
        ],
        methods: [
          { name: 'hasCapacity', returnType: 'boolean', visibility: 'public', parameters: [], description: 'بررسی باقی‌ماندن ظرفیت خالی' },
          { name: 'addPrerequisite', returnType: 'void', visibility: 'public', parameters: [{ name: 'preCourse', type: 'Course' }], description: 'تعیین درس پیش‌نیاز' }
        ]
      },
      {
        id: 'cu5',
        name: 'Enrollment',
        persianName: 'ثبت‌نام و کارنامه ترمی',
        stereotype: 'entity',
        description: 'رکورد ثبت‌نام یک درس توسط دانشجو در یک ترم مشخص و نمره نهایی.',
        attributes: [
          { name: 'term', type: 'String', visibility: 'private', description: 'نیم‌سال تحصیلی (مثلاً ۴۰۳۱)' },
          { name: 'grade', type: 'double', visibility: 'private', description: 'نمره نهایی از ۲۰' },
          { name: 'status', type: 'String', visibility: 'private', description: 'وضعیت: قبول، مردود، حذف اضطراری' }
        ],
        methods: [
          { name: 'isPassed', returnType: 'boolean', visibility: 'public', parameters: [], description: 'آیا نمره بالای ۱۰ شده است؟' }
        ]
      }
    ],
    relationships: [
      { id: 'ru1', source: 'Student', target: 'Person', type: 'inheritance', label: 'ارث‌بری' },
      { id: 'ru2', source: 'Professor', target: 'Person', type: 'inheritance', label: 'ارث‌بری' },
      { id: 'ru3', source: 'Student', target: 'Enrollment', type: 'association', sourceMultiplicity: '1', targetMultiplicity: '1..*' },
      { id: 'ru4', source: 'Course', target: 'Enrollment', type: 'association', sourceMultiplicity: '1', targetMultiplicity: '0..*' },
      { id: 'ru5', source: 'Professor', target: 'Course', type: 'association', sourceMultiplicity: '1', targetMultiplicity: '1..*', label: 'تدریس می‌کند' }
    ],
    actors: [
      { id: 'au1', name: 'دانشجو', description: 'دانشجوی در حال تحصیل' },
      { id: 'au2', name: 'استاد', description: 'عضو هیئت علمی یا حق‌التدریس' },
      { id: 'au3', name: 'آموزش کل', description: 'کارشناس آموزش دانشگاه' }
    ],
    useCases: [
      { id: 'ucu1', name: 'انتخاب واحد اینترنتی', actors: ['دانشجو'], description: 'ثبت دروس بر اساس چارت و پیش‌نیازها' },
      { id: 'ucu2', name: 'مشاهده کارنامه ترمی', actors: ['دانشجو'], description: 'مشاهده نمرات و درخواست تجدیدنظر' },
      { id: 'ucu3', name: 'ثبت نمرات پایانی', actors: ['استاد'], description: 'ورود نمرات تستی و تشریحی دانشجویان' },
      { id: 'ucu4', name: 'تایید لیست نهایی دروس', actors: ['آموزش کل'], description: 'قفل کردن نمرات و محاسبه معدل کل' }
    ]
  }
];
